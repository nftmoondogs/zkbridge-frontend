import dynamic from 'next/dynamic'

const BridgePanel = dynamic(
  () => import('@/components/BridgePanel'),
  { ssr: false }
)
export default function Home() {

  return (
    <main className='flex h-full w-full items-start justify-center md:items-center mx-auto py-8'>
      <div className='min-h-30 mx-auto w-full max-w-lg px-2 sm:w-11/12 sm:px-0'>
        <BridgePanel />
      </div>
    </main>
  )
}
