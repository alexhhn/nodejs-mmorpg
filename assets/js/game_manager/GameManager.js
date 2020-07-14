class GameManager {
  constructor(scene, mapData) {
    this.scene = scene;
    this.mapData = mapData;

    this.spawners = {};
    this.chests = {};
    this.monsters = {};

    this.playerLocations = [];
    this.chestLocations = {};
    this.monsterLocations = {};
  }


  setup() {
    this.parseMapData();
    this.setupEventListener();
    this.setupSpawners();
    this.spawnPlayer();
  }

  parseMapData() {
    this.mapData.forEach((layer) => {
      if (layer.name === 'player_locations') {
        layer.objects.forEach((obj) => {
          this.playerLocations.push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
        });
      } else if (layer.name === 'chest_locations') {
        layer.objects.forEach((obj) => {
          if (this.chestLocations[obj.properties.spawner]) {
            this.chestLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
          } else {
            this.chestLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
          }
        });
      } else if (layer.name === 'monster_locations') {
        layer.objects.forEach((obj) => {
          if (this.monsterLocations[obj.properties.spawner]) {
            this.monsterLocations[obj.properties.spawner].push([obj.x + (obj.width / 2), obj.y - (obj.height / 2)]);
          } else {
            this.monsterLocations[obj.properties.spawner] = [[obj.x + (obj.width / 2), obj.y - (obj.height / 2)]];
          }
        });
      }
    });
  }

  setupEventListener() {
    this.scene.events.on('pickUpChest', (chestId) => {
      // update the spawner
      if (this.chests[chestId]) {
        this.spawners[this.chests[chestId].spawnerId].removeObject(chestId);
      }
    });

    this.scene.events.on('monsterAttacked', (monsterId) => {
      // update the spawner
      if (this.monsters[monsterId]) {
        // subtract health monster model
        this.monsters[monsterId].loseHealth();

        // check the monsters health, and if dead remove that object
        if (this.monsters[monsterId].health <= 0) {
          // removing the monster
          this.spawners[this.monsters[monsterId].spawnerId].removeObject(monsterId);
          this.scene.events.emit('monsterRemoved', monsterId);
        } else {
          // update the monsters health
          this.scene.events.emit('updateMonsterHealth', monsterId, this.monsters[monsterId].health);
        }
      }
    });
  }

  setupSpawners() {
    const config = {
      spawnInterval: 3000,
      limit: 4,
      spawnerType: SpawnerType.CHEST,
      id: '',
    };

    let spawner;   // initialize varibale

    // create chest spawners
    Object.keys(this.chestLocations).forEach((key) => {
      config.id = `chest-${key}`;  // update the unique id for the chest

      spawner = new Spawner(
        config,
        this.chestLocations[key],
        this.addChest.bind(this),
        this.deleteChest.bind(this)
      );
      this.spawners[spawner.id] = spawner;
    });

    // create monster spawners
    Object.keys(this.monsterLocations).forEach((key) => {
      config.id = `monster-${key}`;              // update the unique id for the monster
      config.spawnerType = SpawnerType.MONSTER;  // update the spawner type

      spawner = new Spawner(
        config,
        this.monsterLocations[key],
        this.addMonster.bind(this),
        this.deleteMonster.bind(this),
      );
      this.spawners[spawner.id] = spawner;
    });
  }

  addChest(chestId, chest) {
    this.chests[chestId] = chest;
    this.scene.events.emit('chestSpawned', chest);
  }

  deleteChest(chestId) {
    delete this.chests[chestId];
  }

  addMonster(monsterId, monster) {
    this.monsters[monsterId] = monster;
    this.scene.events.emit('monsterSpawned', monster);
  }

  deleteMonster(monsterId) {
    delete this.monsters[monsterId];
  }

  spawnPlayer() {
    const location = this.playerLocations[Math.floor(Math.random() * this.playerLocations.length)];
    this.scene.events.emit('spawnPlayer', location);
  }
}