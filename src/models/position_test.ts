import 'mocha'
import { assert } from 'chai'

import { Trade, Position } from './'

describe('Position', () => {
  describe('#expected_r', () => {
    it('is calculated before validation', async () => {
      const p1: Position = new Position({
        type: 'Buy',
        limit: 51.5000,
        stop: 50.7500,
        target: 54.5000
      })
      await p1.validate()
      assert.equal(p1.expected_r, 4.0000)


      const p2: Position = new Position({
        type: 'Sell Short',
        limit: 30.7200,
        stop: 30.9800,
        target: 29.4000
      })
      await p2.validate()
      assert.equal(p2.expected_r, 5.0769)
    })
  })

  describe('.match', () => {
    let t1: Trade

    beforeEach(async () => {
      const tradeData: any = {
        symbol: 'GM',
        type: 'Buy',
        quantity_filled: 60,
        filled_price: 51.5000,
        commission: 0.00,
        filled_at: '05/20/25 01:01:57 PM',
        order_no: '11-1958-5850',
        gid: '11-1958-5850'
      }
      t1 = await Trade.create(tradeData)
    });

    [
      [
        {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850',
          gid: '11-1958-5850'
        },
        {
          limit: 51.5000,
          stop: 50.7500,
          target: 54.500
        },
        {
          expected_r: 4.000
        }
      ],
      [
        {
          symbol: 'KHC',
          type: 'Sell Short',
          quantity_filled: 134,
          filled_price: 30.7300,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1982-0619',
          gid: '11-1982-0619'
        },
        {
          limit: 30.7200,
          stop: 30.9800,
          target: 29.400
        },
        {
          expected_r: 5.0769
        }
      ]
    ].forEach(row => {
      it(`creates and associates a position for a '${row[0].type}' trade`, async () => {
        const trd: any = row[0]
        const pra: any = row[1]
        const exp: any = row[2]

        await Position.match(await Trade.create(trd), pra)

        const p: Position = await Position.findOne({
          where: { gid: trd.gid },
          include: [
            { model: Trade, as: 'trades' }
          ]
        })

        assert.equal(p.gid, trd.gid)
        assert.equal(p.type, trd.type)
        assert.equal(p.symbol, trd.symbol)
        assert.equal(p.quantity, trd.quantity_filled)

        assert.equal(p.expected_r, exp.expected_r)

        assert.equal(p.trades?.length, 1)
      })
    });

    ['Sell', 'Buy to Cover'].forEach(type => {
      it(`doesn't create a position for '${type}' trades`, async () => {
        const tradeData: any = {
          symbol: 'GM',
          type: type,
          quantity_filled: 40,
          filled_price: 53.0000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0564',
          gid: '11-1958-5850'
        }
        const t: Trade = await Trade.create(tradeData)

        await Position.match(t)

        const n: number = await Position.count()
        assert.equal(n, 0)
      })
    })

    context('position already exists', () => {
      let pos: Position

      beforeEach(async () => {
        const tradeData: any = {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850',
          gid: '11-1958-5850'
        }
        const t1: Trade = await Trade.create(tradeData)
        pos = await Position.match(t1, {
          limit: 51.5000,
          stop: 50.7500,
          target: 54.500
        })
      })

      it("adds the trade to it's matching position", async () => {
        const tradeData: any = {
          symbol: 'GM',
          type: 'Sell',
          quantity_filled: 40,
          filled_price: 53.0000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0564',
          gid: '11-1958-5850'
        }
        const t2: Trade = await Trade.create(tradeData)

        await Position.match(t2)
        
        const ps: Position[] = await Position.findAll({
          where: { gid: '11-1958-5850' },
          include: [
            { model: Trade, as: 'trades' }
          ]
        })

        assert.equal(ps.length, 1)

        const p: Position = ps[0]

        assert.equal(p.gid, '11-1958-5850')
        assert.equal(p.type, 'Buy', 'Position#type')
        assert.equal(p.symbol, 'GM')
        assert.equal(p.quantity, 60)
        assert.equal(p.expected_r, 4.000)

        assert.equal(p.trades?.length, 2)
      })
    })

    describe("calculating a trade's #realized_r", () => {
      it('for Long Trade', async () => {
        const t1Data: any = {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850',
          gid: '11-1958-5850'
        }
        const t1: Trade = await Trade.create(t1Data)
        await Position.match(t1, {
          limit: 51.5000,
          stop: 50.7500,
          target: 54.500
        })

        const t2Data: any = {
          symbol: 'GM',
          type: 'Sell',
          quantity_filled: 40,
          filled_price: 53.0000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0564',
          gid: '11-1958-5850'
        }
        const t2: Trade = await Trade.create(t2Data)
        await Position.match(t2)

        await t2.reload()

        assert.equal(t2.realized_r, 1.3333)
      })

      it('for Short Trade', async () => {
        const t1Data: any = {
          symbol: 'KHC',
          type: 'Sell Short',
          quantity_filled: 134,
          filled_price: 30.7300,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850',
          gid: '11-1958-5850'
        }
        const t1: Trade = await Trade.create(t1Data)
        await Position.match(t1, {
          limit: 38.7200,
          stop: 30.9800,
          target: 29.4000
        })

        const t2Data: any = {
          symbol: 'KHC',
          type: 'Buy to Cover',
          quantity_filled: 90,
          filled_price: 29.7300,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0564',
          gid: '11-1958-5850'
        }
        const t2: Trade = await Trade.create(t2Data)
        await Position.match(t2)

        await t2.reload()

        assert.equal(t2.realized_r, 2.6866)
      })
    })
  
    describe('when position is fully closed out', () => {
      let pos: Position
      beforeEach(async () => {
        const t1: Trade = await Trade.create(<any>{
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850',
          gid: '11-1958-5850'
        })
        await Position.match(t1, {
          limit: 51.5000,
          stop: 50.7500,
          target: 54.500
        })

        const t2: Trade = await Trade.create(<any>{
          symbol: 'GM',
          type: 'Sell',
          quantity_filled: 40,
          filled_price: 53.0000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0564',
          gid: '11-1958-5850'
        })
        pos = await Position.match(t2)
      })

      it('calculates the #realized_r', async () => {

        assert.isNull(pos.realized_r)
        
        const t3: Trade = await Trade.create(<any>{
          symbol: 'GM',
          type: 'Sell',
          quantity_filled: 20,
          filled_price: 52.2100,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1978-0562',
          gid: '11-1958-5850'
        })
        await Position.match(t3)

        const p: Position = await Position.findOne({
          where: { gid: '11-1958-5850' },
          include: [
            { model: Trade, as: 'trades' }
          ]
        })

        assert.equal(p.realized_r, 1.6489)
      })

      it.skip('it sets the position status to closed')
    })
  })
})