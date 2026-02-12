export interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  abi: any[];
  bytecode: string;
  constructorParams?: {
    name: string;
    type: string;
    description: string;
  }[];
}

export const contractTemplates: ContractTemplate[] = [
  {
    id: "counter",
    name: "Counter",
    description: "A simple counter contract that can increment a value",
    category: "Basic",
    icon: "🔢",
    abi: [
      {
        "inputs": [],
        "name": "count",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "incrementer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    bytecode: "0x6080604052348015600e575f5ffd5b506101588061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610034575f3560e01c806306661abd146100385780631da5772d14610056575b5f5ffd5b610040610060565b60405161004d9190610095565b60405180910390f35b61005e610065565b005b5f5481565b5f5f815480929190610076906100db565b9190505550565b5f819050919050565b61008f8161007d565b82525050565b5f6020820190506100a85f830184610086565b92915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f6100e58261007d565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610117576101166100ae565b5b60018201905091905056fea2646970667358221220d6d1f9b2beff1200b8173cc0143c9f7fa666cddc6448d103dc2c5adfdbf1b0a864736f6c634300081f0033",
    constructorParams: []
  }
];

export const getTemplateById = (id: string): ContractTemplate | undefined => {
  return contractTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): ContractTemplate[] => {
  return contractTemplates.filter(template => template.category === category);
};

export const getAllCategories = (): string[] => {
  return Array.from(new Set(contractTemplates.map(t => t.category)));
};

