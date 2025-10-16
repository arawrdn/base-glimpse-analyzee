'use client'; // WAJIB ada di baris pertama

import React, { useState } from 'react';
// Tidak perlu mengimpor komponen chart lama (AverageTicketsCreated, dll.)

// Ambil Container dari template Anda
import Container from "@/components/container";

// --- Komponen Dashboard Sederhana untuk Menampilkan Hasil (Ganti dengan Chart VisActor nanti) ---
const ResultsDashboard = ({ result }) => {
    // Anda bisa membuat komponen visualisasi khusus di sini
    return (
        <div className="grid grid-cols-1 gap-4">
            {/* Kartu Skor Kesehatan */}
            <Container className="p-6 bg-green-50 border-l-4 border-green-500">
                <p className="text-sm text-gray-600">HEALTH SCORE</p>
                <h2 className="text-4xl font-extrabold text-green-700 mt-1">{result.healthScore}</h2>
                <p className="text-sm text-gray-500">Saldo ETH Base: {result.baseEthBalance} ETH</p>
            </Container>

            {/* Kartu Token Variety */}
            <Container className="p-6 bg-yellow-50 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600">TOKEN VARIETY (DIVERSIFIKASI)</p>
                <h2 className="text-3xl font-bold mt-1">{result.tokenVariety}</h2>
                <p className="text-sm text-gray-500">Total Transaksi: {result.totalTransactions}</p>
            </Container>

            {/* Di sinilah Anda akan memasukkan chart VisActor untuk visualisasi data ERC20, dll. */}
            <Container className="p-4 bg-white shadow">
                {/*  */}
                <p className="text-lg font-semibold">Area Chart VisActor Akan Muncul Di Sini</p>
                <p className="text-sm text-gray-500">Data mentah ERC-20 Transfers: {result.erc20TransferCount}</p>
            </Container>
        </div>
    );
};


// --- Fungsi Utama (Menggantikan Home() lama) ---
export default function WalletAnalyzer() {
    const [address, setAddress] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAnalyze = async () => {
        // ... (Kode handleAnalyze yang sama, memanggil API Anda)
        if (!address) {
            setError('Mohon masukkan alamat wallet.');
            return;
        }
        setLoading(true);
        setError('');
        setAnalysisResult(null); 

        try {
            const response = await fetch(`/api/analyze-wallet/${address}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal memuat data analisis. Cek log server.');
            }

            setAnalysisResult(data);
        } catch (err) {
            // console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            {/* Header dan Input */}
            <div className="max-w-4xl mx-auto mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                    Base Wallet Health Analyzer 🩺
                </h1>
                
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Tempelkan alamat wallet Base (0x...)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg flex-grow shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !address}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150"
                    >
                        {loading ? 'Menganalisis...' : 'Analisis Wallet'}
                    </button>
                </div>
                
                {error && <p className="text-red-500 font-medium bg-red-100 p-3 rounded-md border border-red-300 mt-4">⚠️ Error: {error}</p>}
                {loading && <p className="text-indigo-600 font-medium mt-4">Sedang mengambil data on-chain dari Base Mainnet...</p>}

            </div>
            {/* Akhir Header dan Input */}


            {/* Tampilkan Hasil atau Chart Default */}
            {analysisResult ? (
                // Tampilkan hasil analisis jika ada
                <ResultsDashboard result={analysisResult} />
            ) : (
                // Tampilkan layout default Anda (opsional, bisa dikosongkan)
                <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                    <p className="text-gray-500">Masukkan alamat wallet untuk memulai analisis kesehatan DeFi di Base Mainnet.</p>
                </div>
            )}
            
        </div>
    );
}
