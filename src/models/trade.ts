import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes
} from 'sequelize'
import { sequelize } from '../db/sequelize'

interface ITrade {
  symbol: string
  type: string
  side: string
  cusip: string
  price: number
  commission: number
  dm?: number
  filled_at: Date

  raw: object
}

class Trade extends Model<InferAttributes<Trade>, InferCreationAttributes<Trade>> {
  declare id: CreationOptional<number>

  declare symbol: string
  declare type: string // What is type?

  declare quantity_filled: number
  declare filled_price: number
  declare commission: number

  declare filled_at: Date

  declare order_no: string
  declare gid: string

  declare created_at: CreationOptional<Date>
  declare updated_at: CreationOptional<Date>

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

  filled_at: DataTypes.DATE,

  order_no: {
    type: DataTypes.STRING,
    set(val: string) {
      this.setDataValue('order_no', val)

      const t = this.getDataValue('type').toLowerCase()
      switch(t) {
        case 'buy':
        case 'short sell':
          this.setDataValue('gid', val)
      }
    }
  },
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
  tableName: 'trades',
  underscored: true,
  
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // deletedAt: 'deleted_at',
  
  // paranoid: true,
})


/**
 * expose
 */

export default Trade
export { type ITrade }