import { PrismaClient } from "@prisma/client"
import { useRuntimeConfig } from "#app"

let prisma: PrismaClient

export const usePrisma = () => {
	const config = useRuntimeConfig()

	if (!prisma) {
		prisma = new PrismaClient({
			datasources: {
				db: {
					url: config.prisma.database,
				},
			},
		})
	}

	return prisma
}
