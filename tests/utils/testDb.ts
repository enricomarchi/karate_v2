import { PrismaClient } from "@prisma/client"

// Create test client
const prismaTest = new PrismaClient({
	datasources: {
		db: {
			url: "mysql://emarchi1_admin:932197Silvestr_@localhost:3306/karate_gare_test",
		},
	},
})

export const setupTestDb = async () => {
	// Clear test data
	await prismaTest.fasce_eta.deleteMany()
}

export const teardownTestDb = async () => {
	await prismaTest.$disconnect()
}

export default prismaTest
