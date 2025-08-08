import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Get total counts for each product type
        const [cproCount, c2Count, cbasicCount, kkCount, zubehoerCount, outerKartonCount] = await Promise.all([
            prisma.singleItem.count(),
            prisma.singleItemC2.count(), 
            prisma.singleItemCbasic.count(),
            prisma.singleItemKK.count(),
            prisma.zubehoerEtikett.count(),
            prisma.outerKarton.count()
        ]);

        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [recentCpro, recentC2, recentCbasic, recentKK, recentZubehoer, recentOuterKarton] = await Promise.all([
            prisma.singleItem.count({ where: { datum: { gte: thirtyDaysAgo } } }),
            prisma.singleItemC2.count({ where: { datum: { gte: thirtyDaysAgo } } }),
            prisma.singleItemCbasic.count({ where: { datum: { gte: thirtyDaysAgo } } }),
            prisma.singleItemKK.count({ where: { datum: { gte: thirtyDaysAgo } } }),
            prisma.zubehoerEtikett.count({ where: { created_at: { gte: thirtyDaysAgo } } }),
            prisma.outerKarton.count({ where: { createdAt: { gte: thirtyDaysAgo } } })
        ]);

        // Get festplatte distribution for C Pro
        const cproFestplatten = await prisma.singleItem.groupBy({
            by: ['festplattengroesse'],
            _count: { id: true },
            where: { festplattengroesse: { not: null } }
        });

        // Get configuration distribution for C2
        const c2Configs = await prisma.singleItemC2.groupBy({
            by: ['konfiguration'],
            _count: { id: true },
            where: { konfiguration: { not: null } }
        });

        // Get optics distribution for KK
        const kkOptics = await prisma.singleItemKK.groupBy({
            by: ['anzahl_optiken'],
            _count: { id: true },
            where: { anzahl_optiken: { not: null } }
        });

        // Get monthly production data for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const monthlyData = await Promise.all([
            prisma.singleItem.findMany({
                where: { datum: { gte: twelveMonthsAgo } },
                select: { datum: true }
            }),
            prisma.singleItemC2.findMany({
                where: { datum: { gte: twelveMonthsAgo } },
                select: { datum: true }
            }),
            prisma.singleItemCbasic.findMany({
                where: { datum: { gte: twelveMonthsAgo } },
                select: { datum: true }
            }),
            prisma.singleItemKK.findMany({
                where: { datum: { gte: twelveMonthsAgo } },
                select: { datum: true }
            })
        ]);

        // Process monthly data
        const monthlyStats = processMonthlyData(monthlyData);

        // Get top performers (Prüfer with most items)
        const [cproTopPruefer, c2TopPruefer, cbasicTopPruefer, kkTopPruefer] = await Promise.all([
            prisma.singleItem.groupBy({
                by: ['pruefer_a'],
                _count: { id: true },
                where: { pruefer_a: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.singleItemC2.groupBy({
                by: ['pruefer_a'],
                _count: { id: true },
                where: { pruefer_a: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.singleItemCbasic.groupBy({
                by: ['pruefer_a'],
                _count: { id: true },
                where: { pruefer_a: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            }),
            prisma.singleItemKK.groupBy({
                by: ['pruefer_a'],
                _count: { id: true },
                where: { pruefer_a: { not: null } },
                orderBy: { _count: { id: 'desc' } },
                take: 5
            })
        ]);

        return json({
            success: true,
            data: {
                totals: {
                    cpro: cproCount,
                    c2: c2Count,
                    cbasic: cbasicCount,
                    kk: kkCount,
                    zubehoer: zubehoerCount,
                    outerKarton: outerKartonCount,
                    total: cproCount + c2Count + cbasicCount + kkCount
                },
                recent: {
                    cpro: recentCpro,
                    c2: recentC2,
                    cbasic: recentCbasic,
                    kk: recentKK,
                    zubehoer: recentZubehoer,
                    outerKarton: recentOuterKarton,
                    total: recentCpro + recentC2 + recentCbasic + recentKK
                },
                distributions: {
                    cproFestplatten: cproFestplatten.map(f => ({ 
                        name: f.festplattengroesse, 
                        value: f._count.id 
                    })),
                    c2Configs: c2Configs.map(c => ({ 
                        name: c.konfiguration, 
                        value: c._count.id 
                    })),
                    kkOptics: kkOptics.map(k => ({ 
                        name: k.anzahl_optiken, 
                        value: k._count.id 
                    }))
                },
                monthlyStats,
                topPerformers: {
                    cpro: cproTopPruefer.map(p => ({ name: p.pruefer_a, count: p._count.id })),
                    c2: c2TopPruefer.map(p => ({ name: p.pruefer_a, count: p._count.id })),
                    cbasic: cbasicTopPruefer.map(p => ({ name: p.pruefer_a, count: p._count.id })),
                    kk: kkTopPruefer.map(p => ({ name: p.pruefer_a, count: p._count.id }))
                }
            }
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        return json({ success: false, error: 'Failed to fetch dashboard statistics' }, { status: 500 });
    }
}

function processMonthlyData(monthlyData: any[]): any {
    interface MonthlyStats {
        month: string;
        label: string;
        cpro: number;
        c2: number;
        cbasic: number;
        kk: number;
    }
    
    const months: MonthlyStats[] = [];
    const now = new Date();
    
    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            month: date.toISOString().substring(0, 7), // YYYY-MM format
            label: date.toLocaleDateString('de-DE', { month: 'short', year: 'numeric' }),
            cpro: 0,
            c2: 0,
            cbasic: 0,
            kk: 0
        });
    }
    
    // Count items by month
    monthlyData.forEach((productData, index) => {
        const productType = ['cpro', 'c2', 'cbasic', 'kk'][index];
        productData.forEach((item: any) => {
            const itemMonth = item.datum.toISOString().substring(0, 7);
            const monthData = months.find(m => m.month === itemMonth);
            if (monthData && productType) {
                monthData[productType as keyof typeof monthData]++;
            }
        });
    });
    
    return months;
}
