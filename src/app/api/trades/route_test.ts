import 'mocha'
import { assert } from 'chai'
import { createRequest, ResponseType } from 'node-mocks-http'

import { Trade } from '../../../models'

import { POST } from './route'

describe('/trades', () => {
  // it.skip('Works', async () => {
  //   const req = createRequest({
  //     method: 'GET',
  //     headers: {
  //       'content-type': 'application/json'
  //     }
  //   })

  //   const resp: ResponseType = await GET(req)
  //   const body = await resp.json()
  //   console.log(body)
  // })

  context('POST', () => {
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

    it('updates a trade if it already exists', async () => {
      const d: any = {
        symbol: 'GM',
        type: 'Buy',
        quantity_filled: 60,
        filled_price: 51.5000,
        commission: 0.00,
        filled_at: '05/20/25 01:01:57 PM',
        order_no: '11-1958-5850'
      }
      await Trade.create(d)

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
    })
  })
})