from dataclasses import dataclass

@dataclass
class ComponentDTO:
    type:str
    name:str
    properties:dict