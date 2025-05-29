// SET THE NODE_ENV TO 'test'!!!!!
//
process.env.NODE_ENV = 'test'

// import sinon from 'sinon'
// import { Model } from 'sequelize'
import * as models from './src/models'
import * as sinon from 'sinon'

interface Destroyable {
  destroy: (...args: any[]) => any | Promise<any>
}

export const mochaHooks = {
  afterEach: [
    () => {
      sinon.restore()
    },
    async () => {
      const keys: any[] = Object.keys(models)

      let prs: Promise<any>[] = []

      let i = 0
      const j = keys.length
      for (; i < j; i++) {
        const m: Destroyable = models[keys[i] as keyof typeof models]
        prs.push(m.destroy({ where: {} }))
      }

      // FIXME mysql does not like truncate and throws `Cannot truncate a table
      // referenced in a foreign key constraint`. #destroy seems to be the only
      // option here to clear records after a test. I don't think there is any
      // fix for this outside of not hardcoding constraints into the database
      // and using ORM logic only for cascades
      // await Material.destroy({ where: {} })

      await Promise.all(prs)
    }
  ]
}