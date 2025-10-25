"use client";
import { useState, useEffect } from 'react';

interface ENSSetupModalProps {
  userAddress: string;
  onClose: () => void;
  onENSSet: (ensName: string) => void;
}

export function ENSSetupModal({ userAddress, onClose, onENSSet }: ENSSetupModalProps) {
  const [ensName, setEnsName] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');
  const [existingENS, setExistingENS] = useState<string | null>(null);
  const [availability, setAvailability] = useState<'available' | 'taken' | 'owned' | null>(null);

  // Check if user already has an ENS name using reverse resolution
  useEffect(() => {
    const checkExistingENS = async () => {
      try {
        const response = await fetch('https://eth.llamarpc.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_call',
            params: [
              {
                to: '0xa2c122be93b0074270ebee7f6b7292c7deb45047',
                data: `0x55ea6c47${userAddress.slice(2).padStart(64, '0')}`
              },
              'latest'
            ]
          })
        });
        
        const data = await response.json();
        
        if (data.result && data.result !== '0x') {
          // Decode the result to get ENS name
          const hexResult = data.result.slice(2);
          if (hexResult.length > 128) {
            const lengthHex = hexResult.slice(64, 128);
            const length = parseInt(lengthHex, 16) * 2;
            const nameHex = hexResult.slice(128, 128 + length);
            const name = decodeURIComponent(
              nameHex.match(/.{2}/g)?.map((byte: string) => '%' + byte).join('') || ''
            );
            
            if (name) {
              setExistingENS(name);
              onENSSet(name);
            }
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error checking ENS:', err);
        setLoading(false);
      }
    };

    if (userAddress) {
      checkExistingENS();
    }
  }, [userAddress, onENSSet]);

  const checkENSAvailability = async (name: string) => {
    if (!name) {
      setAvailability(null);
      return;
    }

    const fullName = name.endsWith('.eth') ? name : `${name}.eth`;
    
    setChecking(true);
    setError('');
    
    try {
      // Encode ENS name to namehash
      const namehash = await calculateNamehash(fullName);
      
      // Call ENS resolver
      const response = await fetch('https://eth.llamarpc.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_call',
          params: [
            {
              to: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
              data: `0x0178b8bf${namehash}`
            },
            'latest'
          ]
        })
      });

      const data = await response.json();
      
      if (data.result && data.result !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
        const resolvedAddress = '0x' + data.result.slice(-40);
        
        if (resolvedAddress.toLowerCase() === userAddress.toLowerCase()) {
          setAvailability('owned');
        } else {
          setAvailability('taken');
        }
      } else {
        setAvailability('available');
      }
    } catch (err) {
      console.error('Error checking availability:', err);
      setError('Error checking availability');
    } finally {
      setChecking(false);
    }
  };

  // Simple namehash implementation
  const calculateNamehash = async (name: string) => {
    const labels = name.split('.');
    let node = '0000000000000000000000000000000000000000000000000000000000000000';
    
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = await sha3(labels[i]);
      node = await sha3(hexToBytes(node + labelHash));
    }
    
    return node;
  };

  const sha3 = async (input: string | Uint8Array) => {
    const encoder = new TextEncoder();
    const data = typeof input === 'string' ? encoder.encode(input) : new Uint8Array(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hexToBytes = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace('.eth', '');
    setEnsName(value);
    
    // Debounce the availability check
    const timeoutId = setTimeout(() => {
      if (value) {
        checkENSAvailability(value);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSkip = () => {
    onClose();
  };

  const handleContinue = () => {
    if (existingENS) {
      onENSSet(existingENS);
    }
    onClose();
  };

  const getENSRegistrationLink = () => {
    const name = ensName.replace('.eth', '');
    return `https://app.ens.domains/register/${name}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Checking for ENS name...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-xl">
        {existingENS ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">ENS Name Found!</h2>
              <p className="text-gray-600 mb-4">We found your ENS name:</p>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-2">
                <p className="text-xl font-semibold text-blue-900">{existingENS}</p>
              </div>
              <p className="text-sm text-gray-500 break-all">{userAddress}</p>
            </div>
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continue with ENS
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Up Your ENS Name</h2>
            <p className="text-gray-600 mb-6">
              ENS names make it easier to receive transfers. Check if you have one or register a new name.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Check or search for an ENS name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ensName}
                  onChange={handleInputChange}
                  placeholder="yourname"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-16"
                />
                <span className="absolute right-4 top-3 text-gray-500 font-medium">.eth</span>
              </div>

              {checking && (
                <div className="mt-3 flex items-center text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Checking availability...</span>
                </div>
              )}

              {availability === 'available' && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium mb-2">
                    ✓ {ensName}.eth is available!
                  </p>
                  <a
                    href={getENSRegistrationLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Register on ENS →
                  </a>
                </div>
              )}

              {availability === 'taken' && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    ✗ {ensName}.eth is already taken
                  </p>
                </div>
              )}

              {availability === 'owned' && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm font-medium">
                    ✓ You own {ensName}.eth!
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {availability === 'owned' && (
                <button
                  onClick={() => {
                    onENSSet(`${ensName}.eth`);
                    onClose();
                  }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue with {ensName}.eth
                </button>
              )}
              
              <button
                onClick={handleSkip}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                {existingENS ? 'Close' : 'Skip for Now'}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Don't have an ENS name?{' '}
              <a
                href="https://app.ens.domains"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Register one here
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default ENSSetupModal;