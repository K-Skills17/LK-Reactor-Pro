# Mercado Pago Subscription URLs Configuration

## Environment Variables

Add these variables to your `.env.local` file and Vercel environment variables:

```env
# Mercado Pago Subscription URLs

# Professional Plan - Monthly
NEXT_PUBLIC_PRO_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a3f6b15eafd8472a97fe7baad51abe44

# Professional Plan - Yearly
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PRO_YEARLY_PLAN_ID

# Premium Plan - Monthly
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=c6030c5ab09840bb9d5bace215ef721a

# Premium Plan - Yearly
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PREMIUM_YEARLY_PLAN_ID
```

## How It Works

The pricing page (`app/precos/page.tsx`) will automatically switch between monthly and yearly subscription links based on the user's billing cycle selection:

- **Monthly billing**: Uses `NEXT_PUBLIC_PRO_SUBSCRIBTION` and `NEXT_PUBLIC_PREMIUM_SUBSCRIBTION`
- **Yearly billing**: Uses `NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY` and `NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY`

## Setup Instructions

### 1. Create Yearly Plans in Mercado Pago

1. Go to your [Mercado Pago Dashboard](https://www.mercadopago.com.br/subscriptions)
2. Click on **"Criar plano"** (Create plan)
3. Create a yearly plan for **Professional**:
   - Name: `LK Reactor - Professional (Anual)`
   - Price: `R$ 1970/year`
   - Billing frequency: Yearly
   - Free trial: 14 days
4. Create a yearly plan for **Premium**:
   - Name: `LK Reactor - Premium (Anual)`
   - Price: `R$ 4970/year`
   - Billing frequency: Yearly
   - Free trial: 14 days
5. Copy the `preapproval_plan_id` from each plan's checkout URL

### 2. Update Environment Variables

#### Local Development (`.env.local`)
```bash
# Replace with your actual plan IDs
NEXT_PUBLIC_PRO_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PRO_YEARLY_PLAN_ID
NEXT_PUBLIC_PREMIUM_SUBSCRIBTION_YEARLY=https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=YOUR_PREMIUM_YEARLY_PLAN_ID
```

#### Vercel (Production)
1. Go to your Vercel project
2. Navigate to **Settings** → **Environment Variables**
3. Add all 4 subscription URLs
4. **Redeploy** your project

### 3. Test the Integration

1. Go to your pricing page: `https://yourdomain.com/precos`
2. Toggle between **"Mensal"** and **"Anual"** billing cycles
3. Click on the **"Começar Teste Grátis"** button for PRO or PREMIUM
4. Verify it redirects to the correct Mercado Pago checkout page

## Pricing Breakdown

| Plan | Monthly | Yearly | Yearly Savings |
|------|---------|--------|----------------|
| Professional | R$ 197/mês | R$ 1970/ano (R$ 164/mês) | R$ 394/ano (17% off) |
| Premium | R$ 497/mês | R$ 4970/ano (R$ 414/mês) | R$ 994/ano (17% off) |

## Notes

- The FREE plan always uses `/setup?plan=free` (no payment required)
- Monthly and yearly plans both offer a **14-day free trial**
- The pricing page automatically calculates and displays the savings for yearly plans
- Make sure to use `NEXT_PUBLIC_` prefix so the variables are accessible in the browser
