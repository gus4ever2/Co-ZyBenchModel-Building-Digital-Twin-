from dataclasses import dataclass

@dataclass
class ConstructionSetDTO:
    constructions:list
    construction_set:dict

@dataclass
class ResponseComponentDescriptorDTO:
    id: str
    type: str
    name: str

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "name": self.name
        }
