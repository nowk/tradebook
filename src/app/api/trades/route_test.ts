import 'mocha'
import { assert } from 'chai'
import { createRequest, ResponseType } from 'node-mocks-http'
import * as sinon from 'sinon'

import { Position, Trade } from '../../../models'

import { POST } from './route'

describe('/trades', () => {
  describe('POST', () => {
    it('creates a new trade', async () => {
      const req = createRequest({
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        }
      })

      const resp: ResponseType = await POST(req)
      assert.equal(resp.status, 201)

      const count: number = await Trade.count()
      assert.equal(count, 1)
    })

    context('trade already exists', () => {
      let trade: Trade
      beforeEach(async () => {
        const tradeData: any = {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        }
        trade = await Trade.create(tradeData)
      })

      it('updates the existing trade', async () => {
        const req = createRequest({
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: {
            symbol: 'GM',
            type: 'Buy',
            quantity_filled: 90,
            filled_price: 51.5000,
            commission: 0.00,
            filled_at: '05/20/25 01:01:57 PM',
            order_no: '11-1958-5850'
          }
        })

        const resp: ResponseType = await POST(req)
        assert.equal(resp.status, 200)

        const count: number = await Trade.count()
        assert.equal(count, 1)

        await trade.reload()
        assert.equal(trade.quantity_filled, 90)
      })
    })

    context('Positions', () => {
      it('are matched with related trades', async () => {
        const spy: any = sinon.spy(Position, 'match')

        const praData: any = {
          limit: 51.5000,
          stop: 50.7500,
          target: 54.5000
        }

        const req = createRequest({
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: {
            symbol: 'GM',
            type: 'Buy',
            quantity_filled: 60,
            filled_price: 51.5000,
            commission: 0.00,
            filled_at: '05/20/25 01:01:57 PM',
            order_no: '11-1958-5850',

            ...praData
          }
        })

        await POST(req)

        assert(spy.withArgs(sinon.match.instanceOf(Trade), praData).calledOnce, '.match incorrect call')

        const n: number = await Position.count()
        assert.equal(n, 1)
      })
    })
  })
})