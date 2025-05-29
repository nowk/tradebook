import 'mocha'
import { assert } from 'chai'

import { Trade } from './'


describe('Trade', () => {
  it.skip('cannot have duplicate trades by order_no')

  describe('#gid', () => {
    [
      { type: 'Buy', order_no: '1234' },
      { type: 'Short Sell', order_no: '1234' },
    ].forEach(row => {
      it(`it autosets so order_no for ${row.type}`, () => {
        const { type, order_no } = row

        const t = new Trade({ type, order_no })
        assert.equal(t.gid, '1234')
      })
    });

    [
      { type: 'Sell', order_no: '4567' },
      { type: 'Buy to Cover', order_no: '4567' },
    ].forEach(row => {
      it(`does not set the order number for ${row.type}`, () => {
        const { type, order_no } = row

        const t = new Trade({ type, order_no })
        assert.isUndefined(t.gid)
        assert.equal(t.order_no, '4567')
      })
    })

    it('does not override a defined gid', () => {
      // NOTE attribute order matters
      [
        {
          type: 'Buy',
          gid: '4567',
          order_no: '1234',
        },
        {
          type: 'Buy',
          order_no: '1234',
          gid: '4567',
        }
      ].forEach(element => {
        const t = new Trade(element)
        assert.equal(t.gid, '4567', JSON.stringify(element))
      });
    })
  })

  describe('#value', () => {
    context('Long Trades', () => {
      it('calculated sum before validation, should also be a credit', async () => {
        const data: any = {
          symbol: 'GM',
          type: 'Sell',
          quantity_filled: 40,
          filled_price: 53.0000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        } 

        const t: Trade = new Trade(data)
        await t.validate()

        assert.equal(t.value, 2120.0000)
      })

      it('root trade values should always be a debit', async () => {
        const data: any = {
          symbol: 'GM',
          type: 'Buy',
          quantity_filled: 60,
          filled_price: 51.5000,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        } 

        const t: Trade = new Trade(data)
        await t.validate()

        assert.equal(t.value, -3090.0000)
      })
    })

    describe('Short Trades', () => {
      it('calculated sums before validation, should also be debit', async () => {
        const data: any = {
          symbol: 'KHC',
          type: 'Buy to Cover',
          quantity_filled: 90,
          filled_price: 29.7300,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        } 

        const t: Trade = new Trade(data)
        await t.validate()

        assert.equal(t.value, -2675.7000)
      })

      it('root trade values should always be a credit', async () => {
        const data: any = {
          symbol: 'KHC',
          type: 'Sell Short',
          quantity_filled: 134,
          filled_price: 30.7300,
          commission: 0.00,
          filled_at: '05/20/25 01:01:57 PM',
          order_no: '11-1958-5850'
        } 

        const t: Trade = new Trade(data)
        await t.validate()

        assert.equal(t.value, 4117.8200)
      })
    })
  })
})