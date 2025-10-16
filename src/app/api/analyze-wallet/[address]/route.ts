import { NextRequest, NextResponse } from 'next/server';
import { Alchemy, Network } from 'alchemy-sdk';

const config = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(config);

export async function GET(
  request: NextRequest,
  { params }: { params: { address: string } }
) {
  const address = params.address;

  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: 'Alamat wallet tidak valid.' },
      { status: 400 }
    );
  }

  try {
    // --- MEMULAI ANALISIS SEBENARNYA ---

    // 1. Mengambil Saldo ETH (Native Token)
    const balanceWei = await alchemy.core.getBalance(address, 'latest');
    const ethBalance = Number(balanceWei) / 1e18;

    // 2. Mengambil Saldo Token (untuk skor diversifikasi)
    const tokenBalances = await alchemy.core.getTokenBalances(address);
    const nonZeroTokenCount = tokenBalances.tokenBalances.filter(
      (token) => token.tokenBalance !== '0'
    ).length;

    // 3. Mengambil Jumlah Transaksi (untuk skor aktivitas)
    const txCount = await alchemy.core.getTransactionCount(address);
    
    // 4. Mengambil Riwayat Transfer (untuk skor interaksi DeFi)
    const assetTransfers = await alchemy.core.getAssetTransfers({
        fromBlock: "0x0",
        toAddress: address,
        category: ["erc20"],
        maxCount: 100, // Ambil 100 transaksi terakhir untuk efisiensi
    });
    const erc20TransferCount = assetTransfers.transfers.length;


    // --- LOGIKA PERHITUNGAN SKOR (0-100) ---
    let score = 0;

    // Skor Diversifikasi Aset (Maks 40 poin)
    if (nonZeroTokenCount > 10) {
      score += 40;
    } else if (nonZeroTokenCount > 5) {
      score += 25;
    } else if (nonZeroTokenCount > 1) {
      score += 10;
    }

    // Skor Aktivitas (Maks 30 poin)
    if (txCount > 500) {
      score += 30;
    } else if (txCount > 100) {
      score += 20;
    } else if (txCount > 10) {
      score += 10;
    }
    
    // Skor Interaksi DeFi (Maks 30 poin)
    if (erc20TransferCount > 50) {
        score += 30;
    } else if (erc20TransferCount > 10) {
        score += 15;
    }

    // --- HASIL AKHIR ---
    return NextResponse.json({
      walletAddress: address,
      baseEthBalance: ethBalance.toFixed(4),
      tokenVariety: nonZeroTokenCount,
      totalTransactions: txCount,
      erc20TransferCount: erc20TransferCount,
      healthScore: score, // <-- SKOR SUDAH DIHITUNG!
      analysisTimestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saat memanggil Alchemy API:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data dari Base Mainnet.' },
      { status: 500 }
    );
  }
}
