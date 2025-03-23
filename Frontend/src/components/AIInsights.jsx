import React, { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Tabs,
    Tab,
    Paper,
    Divider,
    Alert,
    IconButton,
} from '@mui/material';
import { Analytics, TrendingUp, AccountBalance, Help } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const AIInsights = ({ symbol, email }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userQuery, setUserQuery] = useState('');
    const [insights, setInsights] = useState(null);
    const [marketAnalysis, setMarketAnalysis] = useState(null);
    const [portfolioRecommendations, setPortfolioRecommendations] = useState(null);

    // Function to get stock insights
    const getStockInsights = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post(`http://localhost:8000/api/ai-insights/stock-insights/${symbol}`, {
                query: userQuery || 'Provide a comprehensive analysis of this stock'
            });
            setInsights(response.data.insights);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch insights');
        } finally {
            setLoading(false);
        }
    };

    // Function to get market analysis
    const getMarketAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('http://localhost:8000/api/ai-insights/market-analysis');
            setMarketAnalysis(response.data.analysis);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch market analysis');
        } finally {
            setLoading(false);
        }
    };

    // Function to get portfolio recommendations
    const getPortfolioRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.post('http://localhost:8000/api/ai-insights/portfolio-recommendations', {
                email
            });
            setPortfolioRecommendations(response.data.recommendations);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch recommendations');
        } finally {
            setLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 0 && symbol) {
            getStockInsights();
        } else if (newValue === 1) {
            getMarketAnalysis();
        } else if (newValue === 2) {
            getPortfolioRecommendations();
        }
    };

    const renderContent = () => {
        if (loading) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                </Box>
            );
        }

        if (error) {
            return (
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            );
        }

        switch (activeTab) {
            case 0:
                return (
                    <Box>
                        <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Ask anything about this stock..."
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={getStockInsights}
                                startIcon={<Help />}
                            >
                                Ask AI
                            </Button>
                        </Box>
                        {insights && (
                            <Paper elevation={2} sx={{ p: 3, whiteSpace: 'pre-line' }}>
                                <Typography variant="body1">
                                    {insights}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                );
            case 1:
                return (
                    <Box>
                        {marketAnalysis && (
                            <Paper elevation={2} sx={{ p: 3, whiteSpace: 'pre-line' }}>
                                <Typography variant="body1">
                                    {marketAnalysis}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                );
            case 2:
                return (
                    <Box>
                        {portfolioRecommendations && (
                            <Paper elevation={2} sx={{ p: 3, whiteSpace: 'pre-line' }}>
                                <Typography variant="body1">
                                    {portfolioRecommendations}
                                </Typography>
                            </Paper>
                        )}
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Card elevation={3}>
                <CardContent>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Analytics /> AI Market Insights
                    </Typography>
                    
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        variant="fullWidth"
                        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab 
                            icon={<Help />} 
                            label="Stock Insights" 
                            disabled={!symbol}
                        />
                        <Tab 
                            icon={<TrendingUp />} 
                            label="Market Analysis" 
                        />
                        <Tab 
                            icon={<AccountBalance />} 
                            label="Portfolio Recommendations" 
                        />
                    </Tabs>

                    <Box sx={{ mt: 2 }}>
                        {renderContent()}
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AIInsights; 