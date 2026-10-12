import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

const initialData = {
	products: [
		{
			productId: 'PROD-001',
			name: 'Mechanical Keyboard',
			category: 'Electronics',
			points: 50,
			amount: 89.99,
			imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300'
		},
		{
			productId: 'PROD-002',
			name: 'Ergonomic Mouse',
			category: 'Electronics',
			points: 30,
			amount: 49.99,
			imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300'
		},
		{
			productId: 'PROD-003',
			name: 'Noise Cancelling Headphones',
			category: 'Audio',
			points: 100,
			amount: 199.99,
			imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'
		},
		{
			productId: 'PROD-004',
			name: 'Stainless Steel Water Bottle',
			category: 'Lifestyle',
			points: 15,
			amount: 24.50,
			imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300'
		}
	],
	customers: [
		{
			customerId: 'CUST-001',
			name: 'Alice Johnson',
			country: 'USA',
			address1: '123 Market St',
			address2: 'Apt 4B',
			city: 'San Francisco',
			state: 'CA',
			zipCode: '94105',
			email: 'alice@example.com',
			contactPhone: '+1-555-0101',
			availablePoints: 250
		},
		{
			customerId: 'CUST-002',
			name: 'Bob Smith',
			country: 'USA',
			address1: '456 Elm Ave',
			address2: 'Suite 200',
			city: 'Austin',
			state: 'TX',
			zipCode: '78701',
			email: 'bob@example.com',
			contactPhone: '+1-555-0202',
			availablePoints: 120
		}
	],
	orders: [
		{
			orderId: 'ORD-1001',
			orderDate: '2026-10-10T14:32:00.000Z',
			customerId: 'CUST-001',
			orderAmount: 139.98,
			totalPoints: 80,
			items: [
				{
					orderId: 'ORD-1001',
					orderLineId: '1',
					productId: 'PROD-001',
					quantity: 1,
					unitPrice: 89.99,
					unitPoints: 50,
					totalPrice: 89.99,
					totalPoints: 50
				},
				{
					orderId: 'ORD-1001',
					orderLineId: '2',
					productId: 'PROD-002',
					quantity: 1,
					unitPrice: 49.99,
					unitPoints: 30,
					totalPrice: 49.99,
					totalPoints: 30
				}
			]
		}
	]
};

function ensureDbFile() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR, { recursive: true });
	}
	if (!fs.existsSync(DATA_FILE)) {
		fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
	}
}

export function readDb() {
	ensureDbFile();
	const content = fs.readFileSync(DATA_FILE, 'utf-8');
	try {
		return JSON.parse(content);
	} catch (e) {
		return initialData;
	}
}

export function writeDb(data) {
	ensureDbFile();
	fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
