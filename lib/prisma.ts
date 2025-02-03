import { PrismaClient } from "@prisma/client"

let prisma: PrismaClient

if (process.env.NODE_ENV === "production") {
	prisma = new PrismaClient()
} else {
	if (!(global as any).prisma) {
		;(global as any).prisma = new PrismaClient() // Rimosso l'oggetto log
	}
	prisma = (global as any).prisma
}

export { prisma }
