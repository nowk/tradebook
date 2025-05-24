import 'mocha'
import { assert } from 'chai'

import { Trade } from './'


describe('Trade', () => {
  describe('#gid', () => {
    it('it autosets so order_no when Buy or Short Sell', () => {
      const t1 = new Trade({ type: 'Buy', order_no: '1234' })
      assert.equal(t1.gid, '1234')

      const t2 = new Trade({ type: 'Short Sell', order_no: '4567' })
      assert.equal(t2.gid, '4567')

      const t3 = new Trade({ type: 'Sell', order_no: '7890' })
      assert.isUndefined(t3.gid)
      assert.equal(t3.order_no, '7890')
    })
  })
})