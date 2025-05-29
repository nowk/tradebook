class AddPositionIdToTrades < ActiveRecord::Migration[5.2]
  def change
    add_reference :trades, :position, index: true
  end
end
