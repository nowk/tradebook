import { Sequelize, Op } from "sequelize"

// FIXME sequelize returning decimals as strings (for precision)
// https://github.com/sequelize/sequelize/issues/11855
(Sequelize as any).DataTypes.postgres.DECIMAL.parse = parseFloat;

// NODE_ENV is the application environment 
const NODE_ENV = process.env.NODE_ENV
if (!NODE_ENV) {
  throw new Error('NODE_ENV must be defined.')
}

// APP_ENV allows use namespace the database into a different environment
// outside of NODE_ENV's. This allows use to run the app in production mode, but
// connect to a different database such as a demo or staging version
const APP_ENV = process.env.APP_ENV || NODE_ENV

// DATABASE_NAME is the database "prefix"
const DATABASE_NAME = process.env.DATABASE_NAME
if (!DATABASE_NAME) {
  throw new Error('DATABASE_NAME must be defined.')
}

/**
 * constants
 */

const POSTGRES_HOST = process.env.POSTGRES_HOST || 'postgres'
const POSTGRES_PORT = process.env.POSTGRES_PORT || 5432
const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME || 'postgres'
const POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD
const DATABASE = DATABASE_NAME + '_' + APP_ENV

/**
 * sequelize is our Sequelize instance
 */

const sequelize = new Sequelize(
  DATABASE,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  {
    host: POSTGRES_HOST,
    port: <number>POSTGRES_PORT,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: (NODE_ENV === "test" || NODE_ENV === "development" ? false : console.log)
  }
)

/**
 * expose
 */

export { sequelize }
export { Sequelize }
export { Op }