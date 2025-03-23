import AIInsights from '../components/AIInsights';

const StockDetails = () => {
    return (
        <div>
            {/* Existing stock details content */}
            
            {/* Add AI Insights section */}
            <AIInsights 
                symbol={symbol} 
                email={user?.email} 
            />
        </div>
    );
};

export default StockDetails; 