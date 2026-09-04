# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

class TradingAgentJudge(gl.Contract):
    agent_a_name: str
    agent_a_prediction: str
    agent_a_target_price: str
    agent_b_name: str
    agent_b_prediction: str
    agent_b_target_price: str
    asset: str
    entry_price: str
    current_price: str
    verdict: str
    winner: str
    total_battles: u32

    def __init__(self):
        self.agent_a_name = ""
        self.agent_a_prediction = ""
        self.agent_a_target_price = ""
        self.agent_b_name = ""
        self.agent_b_prediction = ""
        self.agent_b_target_price = ""
        self.asset = ""
        self.entry_price = ""
        self.current_price = ""
        self.verdict = "no battle yet"
        self.winner = "none"
        self.total_battles = 0

    @gl.public.write
    def submit_predictions(self, asset: str, agent_a_name: str, agent_a_prediction: str, agent_a_target_price: str, agent_b_name: str, agent_b_prediction: str, agent_b_target_price: str):
        self.asset = asset
        self.agent_a_name = agent_a_name
        self.agent_a_prediction = agent_a_prediction
        self.agent_a_target_price = agent_a_target_price
        self.agent_b_name = agent_b_name
        self.agent_b_prediction = agent_b_prediction
        self.agent_b_target_price = agent_b_target_price

        def get_entry_price() -> str:
            page = gl.nondet.web.render("https://api.coinpaprika.com/v1/tickers/btc-bitcoin", mode="text")
            prompt = f"""From this Coinpaprika API JSON: "{page[:1000]}"
Extract the current USD price of Bitcoin.
Respond with ONLY a plain number rounded to 2 decimal places. Example: 98500.25"""
            return gl.nondet.exec_prompt(prompt).strip()

        self.entry_price = gl.eq_principle.strict_eq(get_entry_price)
        self.verdict = "predictions submitted, awaiting judgment"
        self.winner = "pending"

    @gl.public.write
    def fetch_and_judge(self):
        def get_current_price() -> str:
            page = gl.nondet.web.render("https://api.coinpaprika.com/v1/tickers/btc-bitcoin", mode="text")
            prompt = f"""From this Coinpaprika API JSON: "{page[:1000]}"
Extract the current USD price of Bitcoin.
Respond with ONLY a plain number rounded to 2 decimal places. Example: 98500.25"""
            return gl.nondet.exec_prompt(prompt).strip()

        self.current_price = gl.eq_principle.strict_eq(get_current_price)

        try:
            current = float(self.current_price)
            target_a = float(self.agent_a_target_price)
            target_b = float(self.agent_b_target_price)
            entry = float(self.entry_price)

            diff_a = abs(target_a - current)
            diff_b = abs(target_b - current)

            if diff_a < diff_b:
                self.winner = self.agent_a_name
                self.verdict = f"{self.agent_a_name} wins. Entry: ${entry:.2f}, Current: ${current:.2f}. Target A was ${diff_a:.2f} away vs Target B ${diff_b:.2f} away."
            elif diff_b < diff_a:
                self.winner = self.agent_b_name
                self.verdict = f"{self.agent_b_name} wins. Entry: ${entry:.2f}, Current: ${current:.2f}. Target B was ${diff_b:.2f} away vs Target A ${diff_a:.2f} away."
            else:
                self.winner = "tie"
                self.verdict = f"Tie! Both targets equally distant from current price ${current:.2f}."
        except Exception as e:
            self.winner = "error"
            self.verdict = f"Math error: {str(e)}"

        self.total_battles += 1

    @gl.public.view
    def get_battle_result(self) -> dict:
        return {
            "asset": self.asset,
            "entry_price": self.entry_price,
            "current_price": self.current_price,
            "agent_a": {"name": self.agent_a_name, "prediction": self.agent_a_prediction, "target": self.agent_a_target_price},
            "agent_b": {"name": self.agent_b_name, "prediction": self.agent_b_prediction, "target": self.agent_b_target_price},
            "winner": self.winner,
            "verdict": self.verdict,
            "total_battles": self.total_battles
        }
