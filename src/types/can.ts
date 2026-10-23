export type CanId = string;

export interface Can {
  id: CanId;
  name: string;
  line: string;          
  flavorColor: string;   
  caffeineMg?: number;   
  sugarG?: number;
  volumeMl?: number;
  image?: string;        
}