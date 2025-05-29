class AddValueToTrades < ActiveRecord::Migration[5.2]
  def change
    add_column :trades, :value, :decimal, precision: 15, scale: 8
  end
end
