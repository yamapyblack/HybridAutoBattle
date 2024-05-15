import { type Unit } from "../interfaces/interface";
export default class LocalStore {
  private static instance: LocalStore;
  private constructor() {
    // private constructor
  }

  private playerMainMembers: Unit[] = [];
  private playerSubMembers: Unit[] = [];
  private stage: number = 0;

  public static getInstance(): LocalStore {
    if (!LocalStore.instance) {
      LocalStore.instance = new LocalStore();
    }

    return LocalStore.instance;
  }

  public setPlayerMembers(members: Unit[]): void {
    this.playerMainMembers = members;
  }

  public getPlayerMembers(): Unit[] {
    return this.playerMainMembers;
  }

  public addPlayerMember(member: Unit): void {
    this.playerMainMembers.push(member);
  }

  public removePlayerMember(member: Unit): void {
    this.playerMainMembers = this.playerMainMembers.filter((m) => m !== member);
  }

  public setPlayerSubMembers(members: Unit[]): void {
    this.playerSubMembers = members;
  }

  public getPlayerSubMembers(): Unit[] {
    return this.playerSubMembers;
  }

  public addPlayerSubMember(member: Unit): void {
    this.playerSubMembers.push(member);
  }

  public removePlayerSubMember(member: Unit): void {
    this.playerSubMembers = this.playerSubMembers.filter((m) => m !== member);
  }

  public getStage(): number {
    return this.stage;
  }

  public setStage(stage: number): void {
    this.stage = stage;
  }

  public incrementStage(): number {
    return ++this.stage;
  }
}
