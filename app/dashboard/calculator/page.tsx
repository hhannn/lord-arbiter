// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// export default function CalculatorPage() {


//     function setEditStartType(arg0: string) {
//         throw new Error("Function not implemented.");
//     }

//     return (
//         <div className="pt-16 h-full flex items-center justify-center">
//             <div className="flex flex-col gap-2 p-4 items-center justify-center">
//                 <Card className="min-w-xl max-w-xl">
//                     <CardHeader>
//                         <CardTitle className="text-3xl">The sunrise planner</CardTitle>
//                         <CardDescription>Navigate the market's night with precision, preparing your trades for the dawn.</CardDescription>
//                     </CardHeader>
//                     <CardContent className="grid grid-cols-3 gap-4">
//                         <Label className="flex-1/2">Equity</Label>
//                         <Input className="col-span-2" />
//                         <Label className="flex-1/2">Starting size</Label>
//                         <div className="col-span-2 flex gap-2">
//                             <Input
//                                 type="number"
//                                 step="any"
//                                 placeholder="3"
//                             />
//                             <Select>
//                                 <SelectTrigger>
//                                     <SelectValue placeholder={"% of equity"}></SelectValue>
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectGroup>
//                                         <SelectItem value="percent_equity">% of equity</SelectItem>
//                                         <SelectItem value="USDT">USDT</SelectItem>
//                                     </SelectGroup>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                         <Label className="flex-1/2">Rebuy %</Label>
//                         <Input type="number" step={0.01} className="col-span-2" placeholder="1" />
//                         <Label className="flex-1/2">Multiplier</Label>
//                         <Input type="number" step={0.01} className="col-span-2" placeholder="1.2" />
//                         <Label className="flex-1/2">Leverage</Label>
//                         <Input type="number" step={0.01} className="col-span-2" placeholder="25" />
//                     </CardContent>
//                     <CardFooter className="flex justify-end">
//                         <Button>Calculate</Button>
//                     </CardFooter>
//                 </Card>
//             </div>
//         </div>
//     );
// }
