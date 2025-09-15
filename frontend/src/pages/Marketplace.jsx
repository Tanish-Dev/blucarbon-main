import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ShoppingCart, 
  Wallet, 
  DollarSign, 
  Clock, 
  MapPin, 
  Leaf,
  TrendingUp,
  Eye,
  Download,
  Calendar,
  Building,
  Shield,
  Hash,
  Globe,
  Users
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Mock marketplace data
const mockMarketplaceListings = [
  {
    id: 1,
    project: "Mangrove Restoration — Godavari Estuary",
    location: "Andhra Pradesh, India",
    credits: 25.0,
    pricePerCredit: 850,
    vintage: "2024",
    methodology: "VM0033",
    status: "Available",
    organization: "CoastalCare NGO",
    description: "Large-scale mangrove restoration and conservation project in the Godavari estuary, focusing on blue carbon sequestration and coastal protection.",
    startDate: "January 2024",
    area: "126 hectares",
    projectType: "Blue Carbon",
    verificationStandard: "Verra VCS",
    mrvHash: "0x8f9c1a7b23d4e567f890a1b2c3d4e5f6789abcdef123456789abcdef0123bd3a",
    cobenefits: ["Coastal Protection", "Biodiversity Conservation", "Community Livelihoods", "Water Quality Improvement"],
    totalCreditsIssued: 25.0,
    totalCreditsRetired: 0.5,
    confidence: 0.72
  },
  {
    id: 2,
    project: "Seagrass Conservation — Tamil Nadu",
    location: "Tamil Nadu, India", 
    credits: 18.5,
    pricePerCredit: 920,
    vintage: "2024",
    methodology: "VM0033",
    status: "Available",
    organization: "Marine Foundation",
    description: "Seagrass meadow restoration project focusing on carbon sequestration and marine ecosystem restoration.",
    startDate: "March 2024",
    area: "89 hectares",
    projectType: "Blue Carbon",
    verificationStandard: "Verra VCS",
    mrvHash: "0x7e8d2c6b54a3f981c7e2d4f5b890a1c2d3e4f5g6789abcdef123456789abcdef01",
    cobenefits: ["Marine Biodiversity", "Fish Habitat", "Coastal Stability", "Carbon Sequestration"],
    totalCreditsIssued: 18.5,
    totalCreditsRetired: 0,
    confidence: 0.68
  },
  {
    id: 3,
    project: "Coastal Wetland Protection — Kerala",
    location: "Kerala, India",
    credits: 42.3,
    pricePerCredit: 780,
    vintage: "2023",
    methodology: "VM0033", 
    status: "Limited",
    organization: "Ocean Preserve",
    description: "Comprehensive coastal wetland protection and restoration initiative focusing on preserving critical blue carbon ecosystems.",
    startDate: "June 2023",
    area: "203 hectares",
    projectType: "Blue Carbon",
    verificationStandard: "Verra VCS",
    mrvHash: "0x9f1a3b5c78d2e4f6a890b1c2d3e4f5g6h789abcdef123456789abcdef0123456789",
    cobenefits: ["Flood Control", "Wildlife Habitat", "Tourism", "Traditional Fishing"],
    totalCreditsIssued: 50.0,
    totalCreditsRetired: 7.7,
    confidence: 0.75
  }
];

const mockUserTrades = [
  {
    id: 1,
    project: "Mangrove Restoration — Godavari Estuary",
    quantity: 5.0,
    offerPrice: 800,
    status: "Pending",
    createdAt: "Dec 10, 2024"
  },
  {
    id: 2,
    project: "Seagrass Conservation — Tamil Nadu", 
    quantity: 2.5,
    offerPrice: 900,
    status: "Completed",
    createdAt: "Dec 8, 2024"
  }
];

export default function Marketplace() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const { toast } = useToast();

  const handleWalletToggle = () => {
    setWalletConnected(!walletConnected);
    toast({
      title: walletConnected ? 'Wallet disconnected' : 'Wallet connected successfully',
      duration: 2000,
    });
  };

  const handleBuyCredit = (listing) => {
    if (!walletConnected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to purchase credits.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    setSelectedListing(listing);
    setBuyQuantity(1);
    setShowBuyDialog(true);
  };

  const handleConfirmPurchase = () => {
    const totalCost = buyQuantity * selectedListing.pricePerCredit;
    
    // Simulate purchase process
    toast({
      title: 'Purchase successful!',
      description: `Successfully purchased ${buyQuantity} tCO2e from ${selectedListing.project} for ₹${totalCost.toLocaleString()}`,
      duration: 5000,
    });
    
    setShowBuyDialog(false);
    setShowDetailsDialog(false);
    setBuyQuantity(1);
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    setShowDetailsDialog(true);
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Available': 'bg-green-100 text-green-800',
      'Limited': 'bg-yellow-100 text-yellow-800', 
      'Pending': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={`${statusColors[status]} border-0`}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Carbon Credit Marketplace</h1>
              <p className="text-slate-600 mt-1">Buy or retire credits backed by verified MRV hash</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Testnet
              </Badge>
              <Button 
                variant={walletConnected ? "default" : "outline"}
                onClick={handleWalletToggle}
                className="flex items-center gap-2"
              >
                <Wallet size={16} />
                {walletConnected ? '0x8f9c...bd3a' : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="marketplace" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              Marketplace
            </TabsTrigger>
            <TabsTrigger value="trades" className="flex items-center gap-2">
              <DollarSign size={16} />
              My Trades
            </TabsTrigger>
          </TabsList>

          <TabsContent value="marketplace" className="mt-6">
            <div className="grid gap-6">
              {mockMarketplaceListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{listing.project}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-2">
                          <MapPin size={14} />
                          {listing.location}
                        </CardDescription>
                      </div>
                      <StatusBadge status={listing.status} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{listing.credits}</div>
                        <div className="text-sm text-slate-600">tCO2e Available</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">₹{listing.pricePerCredit}</div>
                        <div className="text-sm text-slate-600">Per Credit</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-slate-900">{listing.vintage}</div>
                        <div className="text-sm text-slate-600">Vintage Year</div>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <div className="text-lg font-semibold text-slate-900">{listing.methodology}</div>
                        <div className="text-sm text-slate-600">Methodology</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-slate-600">
                        Listed by <span className="font-medium">{listing.organization}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(listing)}
                        >
                          <Eye size={14} className="mr-1" />
                          View Details
                        </Button>
                        <Button 
                          onClick={() => handleBuyCredit(listing)}
                          disabled={!walletConnected}
                          size="sm"
                          style={{ backgroundColor: 'rgb(0, 224, 122)', color: 'black' }}
                          className="hover:opacity-90"
                        >
                          <ShoppingCart size={14} className="mr-1" />
                          Buy Credits
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trades" className="mt-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">My Purchase Requests</h3>
              {mockUserTrades.length > 0 ? (
                <div className="grid gap-4">
                  {mockUserTrades.map((trade) => (
                    <Card key={trade.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{trade.project}</h4>
                            <p className="text-sm text-slate-600 mt-1">
                              {trade.quantity} tCO2e at ₹{trade.offerPrice}/t
                            </p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={trade.status} />
                            <p className="text-sm text-slate-600 mt-1">{trade.createdAt}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <Clock size={48} className="mx-auto text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No active requests</h3>
                    <p className="text-slate-600">Your purchase requests will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedListing?.project}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base">
              <MapPin size={16} />
              {selectedListing?.location}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="grid gap-6 py-4">
              {/* Project Overview */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Overview</h3>
                <p className="text-slate-600 leading-relaxed">{selectedListing.description}</p>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{selectedListing.credits}</div>
                    <div className="text-sm text-slate-600">Credits Available</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹{selectedListing.pricePerCredit}</div>
                    <div className="text-sm text-slate-600">Price per Credit</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{selectedListing.area}</div>
                    <div className="text-sm text-slate-600">Project Area</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{(selectedListing.confidence * 100).toFixed(0)}%</div>
                    <div className="text-sm text-slate-600">Confidence</div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Project Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Start Date</div>
                        <div className="text-sm text-slate-600">{selectedListing.startDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Organization</div>
                        <div className="text-sm text-slate-600">{selectedListing.organization}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Verification Standard</div>
                        <div className="text-sm text-slate-600">{selectedListing.verificationStandard}</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Project Type</div>
                        <div className="text-sm text-slate-600">{selectedListing.projectType}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Methodology</div>
                        <div className="text-sm text-slate-600">{selectedListing.methodology}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-slate-500" />
                      <div>
                        <div className="font-medium">Vintage Year</div>
                        <div className="text-sm text-slate-600">{selectedListing.vintage}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Credit Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Credit Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-slate-900">{selectedListing.totalCreditsIssued}</div>
                    <div className="text-sm text-slate-600">Total Credits Issued</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-slate-900">{selectedListing.totalCreditsRetired}</div>
                    <div className="text-sm text-slate-600">Total Credits Retired</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-xl font-bold text-green-600">{selectedListing.credits}</div>
                    <div className="text-sm text-slate-600">Available for Purchase</div>
                  </div>
                </div>
              </div>

              {/* MRV Hash */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Verification</h3>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">MRV Hash</span>
                  </div>
                  <code className="text-sm text-slate-700 bg-white px-2 py-1 rounded border">
                    {selectedListing.mrvHash}
                  </code>
                </div>
              </div>

              {/* Co-benefits */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Co-benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedListing.cobenefits.map((benefit, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setShowDetailsDialog(false);
                    handleBuyCredit(selectedListing);
                  }}
                  disabled={!walletConnected}
                  style={{ backgroundColor: 'rgb(0, 224, 122)', color: 'black' }}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Buy Credits
                </Button>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Buy Credits Dialog */}
      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Carbon Credits</DialogTitle>
            <DialogDescription>
              Buy credits from {selectedListing?.project}
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-6 py-4">
              {/* Project Info */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="font-medium text-slate-900">{selectedListing.project}</h4>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <MapPin size={12} />
                  {selectedListing.location}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-slate-600">Price per credit:</span>
                  <span className="font-semibold">₹{selectedListing.pricePerCredit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Available:</span>
                  <span className="font-semibold">{selectedListing.credits} tCO2e</span>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (tCO2e)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.1"
                  max={selectedListing.credits}
                  step="0.1"
                  value={buyQuantity}
                  onChange={(e) => setBuyQuantity(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-slate-500">
                  Maximum available: {selectedListing.credits} tCO2e
                </p>
              </div>

              {/* Purchase Summary */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Quantity:</span>
                  <span className="font-medium">{buyQuantity} tCO2e</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Price per credit:</span>
                  <span className="font-medium">₹{selectedListing.pricePerCredit}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Cost:</span>
                  <span className="font-bold text-lg text-green-700">
                    ₹{(buyQuantity * selectedListing.pricePerCredit).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowBuyDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handleConfirmPurchase}
                  disabled={buyQuantity <= 0 || buyQuantity > selectedListing.credits}
                  style={{ backgroundColor: 'rgb(0, 224, 122)', color: 'black' }}
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Confirm Purchase
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}