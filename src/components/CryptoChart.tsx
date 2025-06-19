const CryptoChart = () => {
  return (
    <div className="glass-card p-6 rounded-lg mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Bitcoin Price</h2>
      </div>
      <div className="h-[400px] w-full">
        <iframe
          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_12345&symbol=BINANCE%3ABTCUSDT&interval=D&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC&withdateranges=true&hide_top_toolbar=0&hide_side_toolbar=0&allow_symbol_change=1&show_popup_button=1&popup_width=1000&popup_height=650"
          className="w-full h-full rounded-lg"
          title="TradingView Widget"
          id="tradingview_12345"
        />
      </div>
    </div>
  );
};

export default CryptoChart;