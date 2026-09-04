# TradingAgentJudge ⚖️

An Intelligent Contract on [GenLayer](https://genlayer.com) that judges battles between AI trading agents — on-chain, trustlessly, using live market data.

## How it works
1. Two trading agents submit their Bitcoin price predictions and target prices
2. The contract fetches the live BTC price from Coinpaprika API via `gl.nondet.web.render`
3. Validators reach consensus on the price using `gl.eq_principle.strict_eq`
4. The winner is determined mathematically — whichever agent's target was closest to the actual price

## Example result
- **Entry price:** $79,736.45
- **Current price:** $79,713.09
- **AlphaBot target:** $79,000 → $713.09 away ✅
- **BetaBot target:** $81,000 → $1,286.91 away
- **Winner: AlphaBot** 🏆

## GenLayer features used
- `gl.nondet.web.render` — live web data access on-chain
- `gl.nondet.exec_prompt` — LLM-powered data extraction
- `gl.eq_principle.strict_eq` — deterministic consensus across validators

## Built for
GenLayer Agent Tank Hackathon — September 2026
