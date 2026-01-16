'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { StageLogo, StageLockup } from './components/logos'

const TOKEN_ADDRESS = '0x0e8a4f5C5C6dD44eBEaBeD5073582Ce48be112AA'
const TOKEN_SYMBOL = 'SEED'

const mockOnChainData = {
  purchases: [
    { txHash: '0xabc123...', amount: 50000, timestamp: 1723737600, priceAtBuy: 0.00089 },
    { txHash: '0xdef456...', amount: 75000, timestamp: 1727020800, priceAtBuy: 0.00112 },
  ],
  currentBalance: 89500,
  totalPurchased: 125000,
  totalSold: 35500,
  firstBuyTimestamp: 1723737600,
}

const priceData = { value: 0.00159, priceChange24h: -41.4 }

function calculateStageScore(data: typeof mockOnChainData, price: number) {
  const now = Date.now() / 1000
  const totalUsdInvested = data.purchases.reduce((sum, p) => sum + p.amount * p.priceAtBuy, 0)
  const purchaseScore = Math.min((totalUsdInvested / 500) * 333, 333)
  const daysSinceFirst = Math.floor((now - data.firstBuyTimestamp) / 86400)
  const holdScore = Math.min((daysSinceFirst / 365) * 333, 333)
  const currentValue = data.currentBalance * price
  const netValueRatio = currentValue / totalUsdInvested
  const netTradingScore = Math.min(netValueRatio * 167, 334)

  return {
    overall: Math.round(purchaseScore + holdScore + netTradingScore),
    breakdown: {
      purchase: Math.round(purchaseScore),
      holdTime: Math.round(holdScore),
      netTrading: Math.round(netTradingScore),
    },
    metrics: {
      totalInvested: totalUsdInvested,
      currentValue,
      holdDays: daysSinceFirst,
      returnPercent: ((netValueRatio - 1) * 100).toFixed(2),
    },
  }
}

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-600 border-t-purple-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center mb-8">
          <StageLogo />
          <h1 className="text-2xl font-bold text-white mt-4 mb-2">Stage Score</h1>
          <p className="text-gray-500">Connect your X account to view your $SEED score</p>
        </div>

        <button
          onClick={() => signIn('twitter')}
          className="flex items-center gap-3 px-6 py-3 rounded-lg transition-all bg-[#6354B0] hover:bg-[#5244A0] text-white font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Login with X
        </button>
      </div>
    )
  }

  const score = calculateStageScore(mockOnChainData, priceData.value)
  const returnPercent = parseFloat(score.metrics.returnPercent)
  const user = session.user as any

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b divider">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-700">
              <img
                src={user.image || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">{user.name}</h1>
              <p className="text-gray-500 text-sm">@{user.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">Rank #26,327</span>
            <span className="px-3 py-1 rounded text-xs text-gray-300 border border-gray-700">Top 9.2%</span>
            <button className="px-4 py-2 rounded-lg text-white font-medium text-sm bg-[#6354B0] hover:bg-[#5244A0]">Score card</button>
            <button
              onClick={() => signOut()}
              className="px-3 py-2 rounded-lg text-gray-400 hover:text-white text-sm border border-gray-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Score Section */}
        <div className="border-b divider">
          <div className="flex items-center justify-between py-4">
            <span className="text-gray-300">Overall</span>
            <div className="flex items-center gap-4">
              <div className="w-32 h-1.5 rounded-full overflow-hidden bg-gray-800">
                <div
                  className="h-full rounded-full bg-[#6354B0]"
                  style={{ width: `${(score.overall / 1000) * 100}%` }}
                ></div>
              </div>
              <span className="text-white text-xl font-light tabular-nums w-16 text-right">{score.overall}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-4 border-b divider">
          <span className="text-gray-400">Purchase</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.purchase}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b divider">
          <span className="text-gray-400">Hold Time</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.holdTime}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b divider">
          <span className="text-gray-400">Net Trading</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.netTrading}</span>
        </div>

        {/* Holdings Table */}
        <div className="mt-6">
          <div className="grid grid-cols-6 gap-4 py-3 text-xs text-gray-500 uppercase tracking-wider border-b divider">
            <div>TOKEN</div>
            <div className="text-right">BALANCE</div>
            <div className="text-right">VALUE</div>
            <div className="text-right">AVG BUY</div>
            <div className="text-right">CURRENT</div>
            <div className="text-right">P/L %</div>
          </div>
          <div className="grid grid-cols-6 gap-4 py-4 items-center border-b divider">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 flex items-center justify-center text-xs">
                S              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{TOKEN_SYMBOL}</span>
                  <span className="text-blue-400 text-xs">â</span>
                </div>
                <span className="text-gray-600 text-xs font-mono">
                  {TOKEN_ADDRESS.slice(0, 6)}...{TOKEN_ADDRESS.slice(-4)}
                </span>
              </div>
            </div>
            <div className="text-right text-white">{(mockOnChainData.currentBalance / 1000).toFixed(1)}K</div>
            <div className="text-right text-white">
              ${(mockOnChainData.currentBalance * priceData.value).toFixed(2)}
            </div>
            <div className="text-right text-gray-400">
              ${(score.metrics.totalInvested / mockOnChainData.totalPurchased).toFixed(6)}
            </div>
            <div className="text-right text-white">${priceData.value.toFixed(6)}</div>
            <div className="text-right">
              <span className={returnPercent >= 0 ? 'text-green-400' : 'text-red-400'}>
                {returnPercent >= 0 ? '+' : ''}
                {score.metrics.returnPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <div className="py-3 text-sm text-gray-500 border-b divider">Transaction History</div>
          {mockOnChainData.purchases.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b divider">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500/20 text-green-400 text-xs">
                  B                </div>
                <div>
                  <span className="text-white text-sm">Buy</span>
                  <span className="text-gray-500 text-xs ml-2">
                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">
                  {(tx.amount / 1000).toFixed(1)}K {TOKEN_SYMBOL}
                </div>
                <div className="text-gray-500 text-xs">@ ${tx.priceAtBuy.toFixed(6)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t divider flex items-center justify-between">
          <StageLockup />
          <a href="https://x.com/4ormund" target="_blank" rel="noopener noreferrer" className="text-gray-500 text-sm hover:text-white transition-colors">
            @{user.username}
          </a>
        </div>
      </div>
    </div>
  )
}
