'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { StageLogo, StageLockup } from './components/logos'
import { useState } from 'react'

const TOKEN_ADDRESS = '0x0e8a4f5C5C6dD44eBEaBeD5073582Ce48be112AA'
const TOKEN_SYMBOL = 'SEED'

// Mock token data matching TGE.FYI format
const mockTokenData = {
  logo: '/seed-logo.png',
  symbol: 'SEED',
  name: 'Seed',
  address: '0x0e8a...12AA',
  chain: 'monad',
  verified: true,
  socials: {
    x: 'https://x.com/seedprotocol',
    discord: 'https://discord.gg/seed'
  },
  price: 0.001478,
  fdv: 1480000,
  mcap: 1480000,
  vsIco: 1377.99,
  vsTge: 1377.99,
  vsAth: null,
  change24h: -7.04,
  // User holdings
  balance: 89500,
  avgBuy: 0.001028,
  currentPrice: 0.001590,
  plPercent: 10.74
}

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

// Mini sparkline chart component
function MiniChart({ positive }: { positive: boolean }) {
  return (
    <svg width="48" height="20" viewBox="0 0 48 20" className="inline-block ml-2">
      <path
        d={positive
          ? "M0,15 L8,12 L16,14 L24,8 L32,10 L40,6 L48,4"
          : "M0,5 L8,8 L16,6 L24,12 L32,10 L40,14 L48,16"
        }
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
      />
    </svg>
  )
}

// Format number with K/M suffix
function formatNumber(num: number): string {
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(2)}K`
  return `$${num.toFixed(2)}`
}

export default function Home() {
  const { data: session, status } = useSession()
  const [walletAddress, setWalletAddress] = useState('')
  const [isEditingWallet, setIsEditingWallet] = useState(false)

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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
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

        {/* Wallet Address Input */}
        <div className="mb-6 p-4 rounded-lg bg-gray-900/50 border border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span className="text-gray-400 text-sm">Wallet Address</span>
            </div>
            {!isEditingWallet ? (
              <button
                onClick={() => setIsEditingWallet(true)}
                className="text-[#6354B0] hover:text-[#7364C0] text-sm"
              >
                {walletAddress ? 'Edit' : 'Add Wallet'}
              </button>
            ) : null}
          </div>
          {isEditingWallet ? (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-[#6354B0]"
              />
              <button
                onClick={() => setIsEditingWallet(false)}
                className="px-4 py-2 rounded-lg bg-[#6354B0] hover:bg-[#5244A0] text-white text-sm"
              >
                Save
              </button>
            </div>
          ) : walletAddress ? (
            <p className="mt-2 text-white font-mono text-sm">{walletAddress}</p>
          ) : (
            <p className="mt-2 text-gray-600 text-sm">No wallet connected - add your wallet to fetch real token data</p>
          )}
        </div>

        {/* Score Section */}
        <div className="border-b border-gray-800">
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

        <div className="flex items-center justify-between py-4 border-b border-gray-800">
          <span className="text-gray-400">Purchase</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.purchase}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-800">
          <span className="text-gray-400">Hold Time</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.holdTime}</span>
        </div>

        <div className="flex items-center justify-between py-4 border-b border-gray-800">
          <span className="text-gray-400">Net Trading</span>
          <span className="text-white text-lg tabular-nums">{score.breakdown.netTrading}</span>
        </div>

        {/* Tracked Tokens Table - TGE.FYI Style */}
        <div className="mt-8">
          <h2 className="text-white font-semibold mb-4">Tracked Tokens</h2>

          {/* Table Header */}
          <div className="grid grid-cols-[minmax(180px,1.5fr)_minmax(120px,1fr)_repeat(6,minmax(80px,1fr))_minmax(70px,0.7fr)] gap-2 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
            <div>Token</div>
            <div>Project Name</div>
            <div className="text-right">Price</div>
            <div className="text-right">FDV</div>
            <div className="text-right">MCAP</div>
            <div className="text-right">VS ICO</div>
            <div className="text-right">VS TGE</div>
            <div className="text-right">VS ATH</div>
            <div className="text-right">24H</div>
          </div>

          {/* Token Row */}
          <div className="grid grid-cols-[minmax(180px,1.5fr)_minmax(120px,1fr)_repeat(6,minmax(80px,1fr))_minmax(70px,0.7fr)] gap-2 py-4 items-center border-b border-gray-800 hover:bg-gray-900/30 transition-colors">
            {/* Token */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-green-400 flex items-center justify-center text-xs font-bold">
                  S
                </div>
                {/* Chain icon */}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-purple-600 border-2 border-gray-900 flex items-center justify-center">
                  <span className="text-[8px] text-white">M</span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-medium">{mockTokenData.symbol}</span>
                  {mockTokenData.verified && (
                    <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <a href="#" className="text-gray-500 hover:text-white">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
                <span className="text-gray-600 text-xs font-mono">{mockTokenData.address}</span>
              </div>
            </div>

            {/* Project Name */}
            <div className="flex items-center gap-2">
              <span className="text-white">{mockTokenData.name}</span>
              <a href={mockTokenData.socials.x} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href={mockTokenData.socials.discord} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
            </div>

            {/* Price */}
            <div className="text-right text-white font-mono">${mockTokenData.price.toFixed(6)}</div>

            {/* FDV */}
            <div className="text-right text-white">{formatNumber(mockTokenData.fdv)}</div>

            {/* MCAP */}
            <div className="text-right text-white">{formatNumber(mockTokenData.mcap)}</div>

            {/* VS ICO */}
            <div className="text-right">
              <span className={mockTokenData.vsIco >= 0 ? 'text-green-400' : 'text-red-400'}>
                {mockTokenData.vsIco >= 0 ? '+' : ''}{mockTokenData.vsIco.toFixed(2)}%
              </span>
            </div>

            {/* VS TGE */}
            <div className="text-right">
              <span className={mockTokenData.vsTge >= 0 ? 'text-green-400' : 'text-red-400'}>
                {mockTokenData.vsTge >= 0 ? '+' : ''}{mockTokenData.vsTge.toFixed(2)}%
              </span>
            </div>

            {/* VS ATH */}
            <div className="text-right text-gray-500">
              {mockTokenData.vsAth !== null ? `${mockTokenData.vsAth}%` : 'N/A'}
            </div>

            {/* 24H with mini chart */}
            <div className="text-right flex items-center justify-end">
              <span className={mockTokenData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                {mockTokenData.change24h >= 0 ? '+' : ''}{mockTokenData.change24h.toFixed(2)}%
              </span>
              <MiniChart positive={mockTokenData.change24h >= 0} />
            </div>
          </div>
        </div>

        {/* User Holdings Summary */}
        <div className="mt-6 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
          <h3 className="text-gray-400 text-sm mb-3">Your Holdings</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-gray-500 text-xs">Balance</p>
              <p className="text-white font-medium">{(mockTokenData.balance / 1000).toFixed(1)}K {mockTokenData.symbol}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Value</p>
              <p className="text-white font-medium">${(mockTokenData.balance * mockTokenData.currentPrice).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Avg Buy</p>
              <p className="text-white font-medium">${mockTokenData.avgBuy.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">P/L</p>
              <p className={mockTokenData.plPercent >= 0 ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                {mockTokenData.plPercent >= 0 ? '+' : ''}{mockTokenData.plPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <div className="py-3 text-sm text-gray-500 border-b border-gray-800">Transaction History</div>

          {mockOnChainData.purchases.map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-green-500/20 text-green-400 text-xs">
                  B
                </div>
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
        <div className="mt-8 pt-4 border-t border-gray-800 flex items-center justify-between">
          <StageLockup />
          <a
            href={`https://x.com/${user.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 text-sm hover:text-white transition-colors"
          >
            @{user.username}
          </a>
        </div>
      </div>
    </div>
  )
}
