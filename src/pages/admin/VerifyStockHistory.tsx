import React, { useState } from 'react';
import { verifyStockHistory } from '../../lib/verifyStockHistory';
import { LineChart } from 'lucide-react';

const VerifyStockHistory: React.FC = () => {
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runVerification = async () => {
    setIsLoading(true);
    try {
      const result = await verifyStockHistory();
      setVerificationResult(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        success: false,
        error: 'Verification failed',
        details: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-neutral-800">Stock History Verification</h1>
        
        <button
          onClick={runVerification}
          disabled={isLoading}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white
            shadow-lg transition-all duration-200 transform
            ${isLoading 
              ? 'bg-emerald-400 cursor-not-allowed opacity-70'
              : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl active:scale-95'
            }
            border border-emerald-600
          `}
        >
          <LineChart size={20} className={`${isLoading ? 'animate-spin' : ''} text-white`} />
          <span className="font-semibold tracking-wide">{isLoading ? 'Verifying...' : 'Run Verification'}</span>
        </button>
      </div>

      {verificationResult && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4 flex items-center gap-2">
              Verification Result:{' '}
              <span 
                className={`
                  inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                  ${verificationResult.success 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                  }
                `}
              >
                {verificationResult.success ? 'Success' : 'Failed'}
              </span>
            </h2>

            {verificationResult.success ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 bg-neutral-50">
                    <h3 className="font-medium mb-3 text-neutral-700">Current Stats</h3>
                    <p className="text-neutral-600">Total Stock: <span className="font-semibold text-neutral-900">{verificationResult.data.currentStats.totalStock}</span></p>
                    <p className="text-neutral-600">Low Stock Items: <span className="font-semibold text-neutral-900">{verificationResult.data.currentStats.lowStockCount}</span></p>
                  </div>

                  <div className="border rounded-lg p-4 bg-neutral-50">
                    <h3 className="font-medium mb-3 text-neutral-700">Latest Snapshot</h3>
                    <p className="text-neutral-600">Month: <span className="font-semibold text-neutral-900">{new Date(verificationResult.data.latestSnapshot.month).toLocaleDateString()}</span></p>
                    <p className="text-neutral-600">Total Stock: <span className="font-semibold text-neutral-900">{verificationResult.data.latestSnapshot.total_stock}</span></p>
                    <p className="text-neutral-600">Low Stock Count: <span className="font-semibold text-neutral-900">{verificationResult.data.latestSnapshot.low_stock_count}</span></p>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-3 text-neutral-700">Snapshot History</h3>
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-full divide-y divide-neutral-200">
                      <thead className="bg-neutral-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700">Month</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Total Stock</th>
                          <th className="px-4 py-3 text-right text-sm font-medium text-neutral-700">Low Stock Count</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-neutral-200">
                        {verificationResult.data.snapshotsHistory.map((snapshot: any) => (
                          <tr key={snapshot.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-neutral-900">
                              {new Date(snapshot.month).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-neutral-900 text-right">{snapshot.total_stock}</td>
                            <td className="px-4 py-3 text-sm text-neutral-900 text-right">{snapshot.low_stock_count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-red-600 bg-red-50 rounded-lg p-4">
                <p className="font-medium">Error: {verificationResult.error}</p>
                {verificationResult.details && (
                  <pre className="mt-2 p-3 bg-red-100 rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(verificationResult.details, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyStockHistory; 