import { Trade } from "../../../models"

// export async function GET(request: Request) {
//   return new Response(JSON.stringify({ hello: 'world' }), {
//     status: 200,
//     headers: { 'Content-Type': 'application/json' }
//   })
// }


type TradeBody = {
  id?: number
  symbol: string
  type: string
  quantity_filled: number
  filled_price: number
  commission: number
  filled_at: Date
  order_no: string
  gid: string
}

export async function POST(request: Request) {
  const body: any = request.body

  const [tr, build]: [Trade, Boolean] = await Trade.findOrBuild({
    where: { order_no: body.order_no },
    defaults: { type: body.type } // FIXME we need type to be set or we get a typeerror
  })
  tr.setAttributes(body)
  await tr.save()

  return new Response(JSON.stringify({
    data: tr
  }), {
    status: build ? 201 : 200,
    headers: { 'Content-Type': 'application/json' }
  })
}