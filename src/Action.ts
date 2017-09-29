export const ActionTypes =
{
    TEXT : "TEXT",
    API_LOCAL : "API_LOCAL",
    API_AZURE : "API_AZURE",
    INTENT : "INTENT",
    CARD : "CARD"
}

export class EntitySuggestion
{
    public entityName : string;
    public entityId : string;

    public constructor(init?:Partial<EntitySuggestion>)
    {
        this.entityName = undefined;
        this.entityId = undefined;
        (<any>Object).assign(this, init);
    }

    public Equal(entitySuggestion : EntitySuggestion) : boolean
    {
        if (!entitySuggestion) return false;
        if (this.entityName != entitySuggestion.entityName) return false;
        if (this.entityId != entitySuggestion.entityId) return false;
        return true;
    }
}

export class ActionMetaData
{
    // Action Type
  
    public actionType : string;

    // Entity Suggestion
  
    public entitySuggestion : EntitySuggestion;

    public constructor(init?:Partial<ActionMetaData>)
    {
        this.actionType = undefined;
        this.entitySuggestion = undefined;
        (<any>Object).assign(this, init);
    }

    public Equal(metaData : ActionMetaData) : boolean
    {
        if (this.actionType != metaData.actionType) return false;
        if (!this.entitySuggestion && metaData.entitySuggestion) return false;
        return this.entitySuggestion.Equal(metaData.entitySuggestion);
    }
}

export class ActionBase
{
    public actionId : string;
    public payload : string;
    public isTerminal : boolean;
    public requiredEntities : string[];
    public negativeEntities : string[];
    public version : number;
    public packageCreationId : number;
    public packageDeletionId : number;
    public metadata : ActionMetaData;

    public constructor(init?:Partial<ActionBase>)
    {
        this.actionId = undefined;
        this.payload = undefined;
        this.isTerminal = undefined;
        this.requiredEntities = undefined;
        this.negativeEntities = undefined;
        this.version = undefined;
        this.packageCreationId = undefined;
        this.packageDeletionId = undefined;
        this.metadata = new ActionMetaData();
        (<any>Object).assign(this, init);
    } 
}

export class ActionList
{
  
    public actions : ActionBase[];

    public constructor(init?:Partial<ActionList>)
    {
        this.actions = undefined;
        (<any>Object).assign(this, init);
    }
}

export class ActionIdList
{
  
    public actionIds : string[];

    public constructor(init?:Partial<ActionIdList>)
    {
        this.actionIds = undefined;
        (<any>Object).assign(this, init);
    }
}