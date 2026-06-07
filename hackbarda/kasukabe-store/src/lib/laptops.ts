import l1 from "@/assets/laptop-1.png";
import l2 from "@/assets/laptop-2.png";
import l3 from "@/assets/laptop-3.png";
import l4 from "@/assets/laptop-4.png";
import l5 from "@/assets/laptop-5.png";
import l6 from "@/assets/laptop-6.png";
import l7 from "@/assets/laptop-7.png";
import l8 from "@/assets/laptop-8.png";

export type Laptop = {
  id: string;
  name: string;
  tagline: string;
  cpu: string;
  ram: string;
  storage: string;
  character: string;
  bestFor: string;
  price: number;
  image: string;
  color: string;
  rating: number;
};

export const LAPTOPS: Laptop[] = [
  { id: "kamen", name: "Action Kamen Pro", tagline: "Hero-grade horsepower", cpu: "Justice i9", ram: "32GB", storage: "1TB SSD", character: "Action Kamen", bestFor: "Gaming & Power Tasks", price: 189999, image: l1, color: "bg-sky", rating: 5 },
  { id: "buriburi", name: "Buriburi Zaemon Ultrabook", tagline: "Princely & paper-thin", cpu: "Royal M3", ram: "16GB", storage: "512GB SSD", character: "Buriburi Zaemon", bestFor: "Travel & Business", price: 144999, image: l2, color: "bg-coral", rating: 5 },
  { id: "bochan", name: "Bo-chan CloudBook", tagline: "Soft, dreamy, sniffly fast", cpu: "Cloud 7", ram: "16GB", storage: "512GB SSD", character: "Bo-chan", bestFor: "Students & Notes", price: 99999, image: l3, color: "bg-cream", rating: 4 },
  { id: "defense", name: "Kasukabe Defense Book", tagline: "Saves the city & your work", cpu: "Guardian 9", ram: "24GB", storage: "1TB SSD", character: "Kasukabe Defense Force", bestFor: "All-rounder", price: 164999, image: l4, color: "bg-lemon", rating: 5 },
  { id: "nene", name: "Nene-chan Studio", tagline: "Creative, expressive, fierce", cpu: "Bunny M2", ram: "16GB", storage: "1TB SSD", character: "Nene-chan", bestFor: "Design & Art", price: 129999, image: l5, color: "bg-mint", rating: 4 },
  { id: "masao", name: "Masao Mini", tagline: "Quiet little powerhouse", cpu: "Pico 5", ram: "8GB", storage: "256GB SSD", character: "Masao-kun", bestFor: "Everyday & Budget", price: 74999, image: l6, color: "bg-cream", rating: 4 },
  { id: "kazama", name: "Kazama Honor Edition", tagline: "Disciplined, dependable", cpu: "Prefect 8", ram: "16GB", storage: "512GB SSD", character: "Kazama-kun", bestFor: "Study & Productivity", price: 119999, image: l7, color: "bg-lemon", rating: 5 },
  { id: "shiro", name: "Shiro Memory Max", tagline: "Never forgets a byte", cpu: "Pup M4", ram: "64GB", storage: "2TB SSD", character: "Shiro", bestFor: "AI & Heavy Workloads", price: 239999, image: l8, color: "bg-sky", rating: 5 },
];

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
