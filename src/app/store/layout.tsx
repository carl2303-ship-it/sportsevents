import { StoreCartProvider } from '@/components/store/cart-context'

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <StoreCartProvider>{children}</StoreCartProvider>
}
