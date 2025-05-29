import { Position, Trade } from "../../../models"

// export async function GET(request: Request) {
//   return new Response(JSON.stringify({ hello: 'world' }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' }
//   })
// }


interface TradeBody {
  id?: number
  symbol: string
  type: string
  quantity_filled: number
  filled_price: number
  commission: number
  filled_at: Date
  order_no: string
  gid: string

  // virtual, to pass to positions
  limit: number
  stop: number
  target: number
}

export async function POST(request: Request) {
  const body: any = request.body

  const [tr, build]: [Trade, Boolean] = await Trade.findOrBuild({
    where: { order_no: body.order_no },
    defaults: { type: body.type } // FIXME we need type to be set or we get a typeerror
  })
  tr.setAttributes(body)
  await tr.save()

  const pra: any = {
    limit: body.limit,
    stop: body.stop,
    target: body.target
  }
  await Position.match(tr, pra) // FIXME this should be queued to a bg process, this may become a 
                                // "long" process

  return new Response(JSON.stringify({
    data: tr
  }), {
    status: build ? 201 : 200,
    headers: { 'Content-Type': 'application/json' }
  })
}