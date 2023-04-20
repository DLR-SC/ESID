/**
 * Return value entry of the api requesting migrations for a node (Returns a list of these objects).
 * 
 * @prop {string} [timestamp] Timestamp for the values if multiple dates are requested.
 * @prop {string} [node]      Node for the values if multiple nodes are requested.
 * @prop {number} incoming    Value for the incoming connection (towards start node).
 * @prop {number} outgoing    Value for the outgoing connection (towards end node).
 */
export interface MigrationConnection {
  timestamp?: string,
  node?: string,
  incoming: number,
  outgoing: number,
}

/**
 * Return value of the api requesting the top migrations for a node (Returns a list of these objects).
 * 
 * @prop {string} [timestamp] Timestamp for node if multiple dates are requested.
 * @prop {string} nodes       Node UUIDs of the top migration entry.
 */
export interface TopMigration {
  timestamp?: string,
  node: string,
}