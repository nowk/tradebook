class CreatePositions < ActiveRecord::Migration[5.2]
  def change
    create_table :positions do |t|
      t.string :symbol
      t.string :type

      t.decimal :limit, precision: 15, scale: 8
      t.decimal :stop, precision: 15, scale: 8
      t.decimal :target, precision: 15, scale: 8

      t.decimal :expected_r, precision: 15, scale: 8
      t.decimal :realized_r, precision: 15, scale: 8
      t.decimal :pl, precision: 15, scale: 8
      
      t.integer :quantity

      t.string :gid

      t.timestamps
    end
  end
end
