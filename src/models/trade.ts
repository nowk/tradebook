import {
  CreationOptional,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes
} from 'sequelize'
import { sequelize } from '../db/sequelize'
import Position from './position'

class Trade extends Model<InferAttributes<Trade>, InferCreationAttributes<Trade>> {
  declare id: CreationOptional<number>

  declare symbol: string
  declare type: string // What is type?

  declare quantity_filled: number
  declare filled_price: number
  declare commission: number
  declare value: number

  declare filled_at: Date

  declare order_no: string
  declare gid: string

  declare realized_r: number

  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

  declare position_id: ForeignKey<Position['id']>;

  static associate(m: any) {

  }
}

Trade.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  symbol: DataTypes.STRING,
  type: DataTypes.STRING,

  quantity_filled: DataTypes.INTEGER,

  filled_price: {
    type: DataTypes.DECIMAL
  },
  commission: {
    type: DataTypes.DECIMAL
  },

  value: DataTypes.DECIMAL, // NOTE this should always be a calculated value,
                            // should never be defined directly
  
  filled_at: DataTypes.DATE,

  position_id: DataTypes.INTEGER,

  order_no: {
    type: DataTypes.STRING,
    set(val: string) {
      this.setDataValue('order_no', val)

      if (!this.getDataValue('gid')) {
        const t = this.getDataValue('type').toLowerCase()
        switch(t) {
          case 'buy':
          case 'short sell':
            this.setDataValue('gid', val)
        }
      }
    }
  },
  gid: DataTypes.STRING,

  realized_r: {
    type: DataTypes.DECIMAL
  },

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
  tableName: 'trades',
  underscored: true,
  
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // deletedAt: 'deleted_at',
  
  // paranoid: true,

  hooks: {
    beforeValidate: (m, _) => {
      m.value = m.quantity_filled * m.filled_price

      // FIXME why does this throw undefined during association via helper like addTrades
      // it seems to call this twice, and the 2nd time it's undefined
      switch(m.type?.toLowerCase()) {
        case 'buy':
        case 'buy to cover':
          m.value = m.value * -1
      }
    }
  }
})


/**
 * expose
 */

export default Trade
// export { type ITrade }