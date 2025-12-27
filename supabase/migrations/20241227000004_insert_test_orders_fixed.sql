-- Insert some test orders to verify the system works
INSERT INTO public."order" (
  name,
  email,
  products,
  number,
  "import export code",
  "shipping address",
  port,
  country,
  status,
  incoterms,
  instructions,
  total_amount,
  payment
) VALUES 
(
  'John Doe',
  'test@example.com',
  '[
    {
      "id": "1",
      "name": "Premium Basmati Rice",
      "price": 1200,
      "quantity": 5,
      "unit": "MT",
      "total": 6000
    },
    {
      "id": "2", 
      "name": "Organic Turmeric Powder",
      "price": 2500,
      "quantity": 2,
      "unit": "MT",
      "total": 5000
    }
  ]'::json,
  9876543210,
  'IEC123456789',
  '123 Business Street, Mumbai',
  'Mumbai Port',
  'India',
  'in transit',
  'FOB',
  'Handle with care - premium quality products',
  11500.00,
  'paid'
),
(
  'Jane Smith',
  'test@example.com',
  '[
    {
      "id": "3",
      "name": "Red Chili Powder",
      "price": 1800,
      "quantity": 3,
      "unit": "MT", 
      "total": 5400
    }
  ]'::json,
  9876543211,
  'IEC987654321',
  '456 Export Avenue, Delhi',
  'Delhi Port',
  'India',
  'delivered',
  'CIF',
  'Urgent delivery required',
  5900.00,
  'paid'
),
(
  'Mike Johnson',
  'test@example.com',
  '[
    {
      "id": "4",
      "name": "Black Pepper Whole",
      "price": 3200,
      "quantity": 1,
      "unit": "MT",
      "total": 3200
    }
  ]'::json,
  9876543212,
  'IEC456789123',
  '789 Trade Center, Chennai',
  'Chennai Port',
  'India',
  'pending',
  'EXW',
  'Quality inspection required before shipment',
  3400.00,
  'paid'
);