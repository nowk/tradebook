class CreateTradesTable < ActiveRecord::Migration[5.2]
  def change
    create_table :trades do |t|
      t.string :symbol
      t.string :type

      t.integer :quantity_filled
      t.decimal :filled_price, precision: 15, scale: 8
      t.decimal :commission, precision: 15, scale: 8

      t.datetime :filled_at

      t.string :order_no
      t.string :gid

      t.timestamps
    end
  end
end
