"use client"
import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { X, Upload, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from '../../hooks/use-toast';

interface AddPortfolioProps {
  open: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
}

const AddPortfolio: React.FC<AddPortfolioProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please provide a title for your portfolio item",
        variant: "destructive"
      });
      return;
    }

    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image for your portfolio item",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const portfolioData = {
        title,
        description,
        category,
        image,
        createdAt: new Date()
      };

      if (onSave) {
        onSave(portfolioData);
      }

      toast({
        title: "Success",
        description: "Portfolio item added successfully",
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCategory('');
      setImage(null);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Portfolio Item</DialogTitle>
          <DialogDescription>
            Showcase your best work to attract more clients
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Bridal Hairstyle" 
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="haircut">Haircut</SelectItem>
                  <SelectItem value="hairstyle">Hairstyle</SelectItem>
                  <SelectItem value="color">Hair Color</SelectItem>
                  <SelectItem value="makeup">Makeup</SelectItem>
                  <SelectItem value="nails">Nails</SelectItem>
                  <SelectItem value="skincare">Skincare</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Describe your work..." 
                rows={4}
              />
            </div>

            <div>
              <Label>Image</Label>
              {image ? (
                <div className="relative mt-2 rounded-lg overflow-hidden">
                  <img 
                    src={image} 
                    alt="Portfolio preview" 
                    className="w-full h-56 object-cover" 
                  />
                  <button 
                    type="button"
                    onClick={() => setImage(null)} 
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                  >
                    <X size={16} className="text-gray-700" />
                  </button>
                </div>
              ) : (
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Image size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload an image in JPG, PNG format
                    </p>
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm">
                        <Upload size={14} className="mr-2" /> Choose Image
                      </Button>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Portfolio Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPortfolio;
