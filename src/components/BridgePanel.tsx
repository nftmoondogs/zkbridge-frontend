import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react';
import cx from 'classnames'
import { useAccount, useBalance, useChainId, useContractRead, useContractWrite, useNetwork, useWaitForTransaction } from 'wagmi';
import { coreDao, coreDaoTestnet, isDevelopment } from '@/constants/chain';
import { useChainModal } from '@rainbow-me/rainbowkit';
import { coreContracts, zkSyncContracts } from '@/constants/contracts';
import { zkSync, zkSyncTestnet } from 'wagmi/chains';
import { formatNumberWithUnit } from '@/utils';
import BridgeAbi from '@/constants/abis/Bridge.json';
import TokenAbi from '@/constants/abis/WOOF.json';

import coreIcon from '@/assets/icons/networks/core.png';
import zkSyncIcon from '@/assets/icons/networks/zkSync.svg';
import arrowDownIcon from '@/assets/icons/arrow-down.svg';
import refreshIcon from '@/assets/icons/refresh.svg';
import { parseUnits } from 'ethers/lib/utils';
import { toast } from 'react-toastify';

const BridgePanel = () => {
  const [inputFocused, setInputFocused] = useState<boolean>(false);
  const [inputBalance, setInputBalance] = useState<number>(0);

  const chainId = useChainId();
  const {chain} = useNetwork();
  const {address} = useAccount();
  const { openChainModal } = useChainModal();
  const {data: coreBalance} = useBalance({
    address,
    token: coreContracts.token,
    chainId: isDevelopment ? coreDaoTestnet.id : coreDao.id,
    watch: true
  })
  const {data: zkSyncBalance} = useBalance({
    address,
    token: zkSyncContracts.token,
    chainId: isDevelopment ? zkSyncTestnet.id : zkSync.id,
    watch: true
  })

  const toZkSync = useMemo(() => {
    return chainId == coreDao.id || chainId == coreDaoTestnet.id
  }, [chainId])

  const tokenAddress = useMemo(() => {
    return toZkSync ? coreContracts.token : zkSyncContracts.token
  }, [toZkSync]);
  
  const bridgeAddress = useMemo(() => {
    return toZkSync ? coreContracts.bridge : zkSyncContracts.bridge
  }, [toZkSync]);

  const {data: allowance } = useContractRead({
    address: tokenAddress,
    abi: TokenAbi,
    functionName: 'allowance',
    args: [address, bridgeAddress],
    watch: true,
    select: (data) => {
      if (typeof(data) == 'bigint') {
        return Number(data / BigInt("1000000000000000000"))
      }

      return undefined;
    }
  })

  const { data: approveTx, isLoading: approving, write: approveToken } = useContractWrite({
    address: tokenAddress,
    abi: TokenAbi,
    functionName: 'approve',
    onError(error) {
      console.log('Error', error);
      toast.error(error.message);
    }
  })

  const { data: sendTx, isLoading: sending, write: bridgeToken } = useContractWrite({
    address: bridgeAddress,
    abi: BridgeAbi,
    functionName: 'send',
    onError(error) {
      console.log('Error', error);
      toast.error(error.message);
    }
  })

  useWaitForTransaction({
    hash: approveTx?.hash,
    onError(error) {
      console.log('Error', error);
      toast.error(error.message);
    },
    onSuccess(data) {
      console.log(data);
      toast.success("Successfully approved");
    },
  })

  useWaitForTransaction({
    hash: sendTx?.hash,
    onError(error) {
      console.log('Error', error);
      toast.error(error.message);
    },
    onSuccess(data) {
      console.log(data);
      toast.success("Successfully sent. Please wait until receive your token");
    },
  });
  
  const fromBalance = useMemo(() => {
    if(toZkSync) {
      return parseFloat(coreBalance?.formatted ?? '0')
    } else {
      return parseFloat(zkSyncBalance?.formatted ?? '0')
    }
  }, [coreBalance, zkSyncBalance, toZkSync])

  const toBalance = useMemo(() => {
    if(toZkSync) {
      return parseFloat(zkSyncBalance?.formatted ?? '0')
    } else {
      return parseFloat(coreBalance?.formatted ?? '0')
    }
  }, [coreBalance, zkSyncBalance, toZkSync])

  useEffect(() => {
    if(inputBalance > fromBalance) {
      setInputBalance(fromBalance);
    }
  }, [inputBalance, fromBalance])

  const handleClick = useCallback(() => {
    if(!inputBalance) {
      return;
    }
    
    if(!allowance || allowance < inputBalance) {
      approveToken({
        args: [bridgeAddress, parseUnits(inputBalance + '')]
      });
    } else {
      const nonce = Math.floor(Math.random() * 1000000);
      const dstChainId = toZkSync ? 
        isDevelopment ? zkSyncTestnet.id : zkSync.id 
        : isDevelopment ? coreDaoTestnet.id : coreDao.id;
      const slippage = 1000;

      bridgeToken({
        args: [address, tokenAddress, parseUnits(inputBalance + ''), dstChainId, nonce, slippage]
      });
    }
  }, [address, allowance, approveToken, bridgeAddress, bridgeToken, inputBalance, toZkSync, tokenAddress]);
  
  return (
    <section className='divide-y-[2px] divide-neutral-200 rounded-lg bg-white shadow'>
      <div className="px-8 pt-4 pb-3 text-2xl font-bold">
        <h2>Bridge</h2>
      </div>
      <div className='px-4 py-5 pb-4 sm:px-8'>
        <form autoComplete='false' className='relative'>
          <div className={
            cx(
              'pl-3 pr-5 flex h-[68px] rounded border', 
              inputFocused ? 'border-blue-500' : 'border-neutral-200'
            )
          }>
            <button
              type='button' 
              onClick={openChainModal}
              className='min-w-[140px] inline-flex items-center rounded-md py-1 px-3 shadow-sm'
            >
              <Image width={20} height={20} src={toZkSync ? coreIcon : zkSyncIcon} alt="icon" />
              <p className='mx-1 overflow-hidden text-sm w-max text-ellipsis'>
                {toZkSync ? "CoreDao" : "zkSync Era"}
              </p>
              <Image width={20} height={20} src={arrowDownIcon} alt="down" />
            </button>
            <div className='relative flex flex-col w-full'>
              <input 
                type='number'
                onFocus={() => {setInputFocused(true)}}
                onBlur={() => {setInputFocused(false)}}
                placeholder='0.00'
                value={inputBalance}
                onChange={(e) => setInputBalance(parseFloat(e.target.value))}
                className='w-full pt-4 pl-2 text-lg text-right text-gray-600 outline-none focus:group-focus:border-blue-500'
              />
              <div className='relative h-6'>
                <div className='absolute right-0 top-0 w-full flex justify-end pb-[0.375rem] text-sm'>
                  <label className='inline-block pr-1 text-gray-400'>Balance</label>
                  <span className='px-3 text-gray-400'>{formatNumberWithUnit(fromBalance)}</span>
                  <button 
                    type='button'
                    onClick={() => setInputBalance(fromBalance)}
                    className='ml-1 font-bold text-blue-500'
                  >
                    MAX
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className='relative flex items-center justify-center h-10'>
            <Image width={14} height={14} src={refreshIcon} alt="refresh icon" />
          </div>
          <div className='grid grid-cols-2 items-center gap-2 rounded border border-gray-300 h-[68px] px-4'>
            <div className='font-bold text-gray-500'>
              <label className='flex items-center'>
                <Image 
                  width={14} 
                  height={14} 
                  content='fit' 
                  src={toZkSync ? zkSyncIcon : coreIcon} 
                  alt="network icon" 
                  className='w-4 h-4 mr-1 -ml-1 text-neutral-500'
                />
                {toZkSync ? "zkSync Era" : "CoreDao"}
              </label>
            </div>
            <div className='flex items-center justify-end w-full'>
              <label className='inline-block pr-1 text-gray-400'>Balance</label>
              <span className='pl-3 text-gray-400'>{formatNumberWithUnit(toBalance)}</span>
            </div>
          </div>
          <button 
            type='button'
            disabled={!inputBalance || approving || sending || chain?.unsupported}
            onClick={handleClick}
            className='w-full p-3 mt-8 bg-blue-700 disabled:opacity-50 hover:scale-[1.05] rounded-full text-2xl font-bold text-white flex justify-center items-center cursor-pointer disabled:cursor-not-allowed'
          >
            {approving ? "Approving ..." : sending ? "Sending ..." : (allowance ?? 0) >= inputBalance ? "Send" : "Approve"}
          </button>
        </form>
      </div>
    </section>
  )
}

export default BridgePanel;
