
import {
  CreationOptional,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
  DataTypes
} from 'sequelize'
import { sequelize } from '../db/sequelize'
import Trade from './trade'

const roundDec = (n: number): number => {
  return Math.round(n * 10000)/10000
}

interface PositionRAttrs {
  limit: number
  stop: number
  target: number
}

class Position extends Model<InferAttributes<Position>, InferCreationAttributes<Position>> {
  declare id: CreationOptional<number>

  declare symbol: string
  declare type: string 

  declare limit: number
  declare stop: number
  declare target: number

  declare expected_r: number
  declare realized_r: number
  declare pl: number

  declare quantity: number

  declare gid: string

  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare addTrade: HasManyAddAssociationMixin<Trade, number>
  declare addTrades: HasManyAddAssociationsMixin<Trade, number>

  declare trades?: NonAttribute<Trade[]>

  static associate(m: any) {
    super.hasMany(m.Trade, { as: 'trades' })
  }

  declare static match: (trade: Trade, pra?: PositionRAttrs) => Promise<Position>
}

Position.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  symbol: DataTypes.STRING,
  type: DataTypes.STRING,

  limit: DataTypes.DECIMAL,
  stop: DataTypes.DECIMAL,
  target: DataTypes.DECIMAL,

  expected_r: DataTypes.DECIMAL,
  realized_r: DataTypes.DECIMAL,
  pl: DataTypes.DECIMAL,

  quantity: DataTypes.NUMBER,

  gid: DataTypes.STRING,

  created_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: sequelize.literal('NOW()')
  },
}, {
  sequelize,
  tableName: 'positions',
  underscored: true,
  
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // deletedAt: 'deleted_at',
  
  // paranoid: true,

  hooks: {
    beforeValidate: (m, _) => {
      m.expected_r = (m.target - m.limit) / (m.limit - m.stop)
      m.expected_r = roundDec(m.expected_r)      // NOTE Force rounding to 4 decimals
    }
  }
})


// match aims to create and associate trades positions. Creating positions from a root trade or
// adding trades to an existing position given a matching gid
// NOTE adding here so we can reference Position properly as a Type within the function
Position.match = async (trade: Trade, pra: PositionRAttrs = <PositionRAttrs>{}): Promise<Position|undefined> => {
  const { symbol, type, gid, quantity_filled: quantity }: any = trade

  let pos: Position = await Position.findOne({
    where: { gid },
    include: [
      { model: Trade, as: 'trades' }
    ]
  })
  if (!pos) {
    if (!~['buy', 'sell short'].indexOf(type.toLowerCase())) {
      return undefined
    }
    // FIXME we assume symbol and gid are always provided, need validation for that
    // or a check to it doesn't continue if missing

    pos = await Position.create({
      symbol,
      type,
      gid,
      quantity,
      ...pra
    })
  }
  await pos.addTrade(trade)

  // FIXME addTrade does not update the trades array
  // https://github.com/sequelize/sequelize/issues/3424#issuecomment-557223303
  pos.trades?.push(trade)

  // need 2 trades or just return
  if (!pos.trades || pos.trades.length < 2) {
    return pos
  }

  // being auxiliary calculations

  const baseTrade: Trade = pos.trades.find(t => t.order_no === pos.gid)
  const qtyResolved: number = pos.trades
    .filter(t => ~['sell', 'buy to cover'].indexOf(t.type.toLowerCase()))
    .map(t => t.quantity_filled)
    .reduce((a, c) => a + c, 0)


  // NOTE technically if you get here, you should never
  if (baseTrade) {
    let a: number, c: number
    const b: number = (trade.quantity_filled / baseTrade.quantity_filled)

    switch(trade.type.toLowerCase()) {
      case 'sell':
        a = (trade.filled_price - baseTrade.filled_price)
        c = (baseTrade.filled_price - pos.stop)
        break;
      case 'buy to cover':
        a = (baseTrade.filled_price - trade.filled_price)
        c = (pos.stop - baseTrade.filled_price)
        break;
    }
    
    // FIXME this should only happen if there is a "valid" realized_r 
    // calculation... what constitutes that?
    
    const realized_r: number = roundDec((a * b) / c)
    await trade.update({ realized_r })
  }
  
  // calculate fully realized_r on the trade when the trade gets fully closed out
  if (pos.quantity - qtyResolved === 0) {
    const pos_realized_r: any = pos.trades
      .filter(t => ~['sell', 'buy to cover'].indexOf(t.type.toLowerCase()))
      .map(t => t.realized_r)
      .reduce((a, c) => a + c, 0)

    await pos.update({ realized_r: roundDec(pos_realized_r) })
  }

  return pos
}


/**
 * expose
 */

export default Position