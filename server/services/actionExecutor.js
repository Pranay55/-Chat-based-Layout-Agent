import {
  resizeArtboard,
  moveNode,
  moveNodeByOffset,
  resizeNode,
  moveNodeRelativeToNode,
  deleteNode,
  changeNodeStyle,
  resizeNodesByType,
  moveNodesByTypeOffset,
  deleteNodesByType,
  alignNodesByType,
  restoreLayoutFromHistory,
  restoreLayoutFromRedoHistory
} from "./layoutTransforms.js";

import {
  validateAction,
  validateActionPlan
} from "../utils/actionValidator.js";

export function executeAction(
  layout,
  action,
  history = [],
  redoHistory = []
) {
  validateAction(action);

  switch (action.type) {
    case "resize_artboard":
      return resizeArtboard(
        layout,
        action.params.width,
        action.params.height
      );

    case "move_node":
      return moveNode(
        layout,
        action.nodeId,
        action.params.position
      );

    case "move_node_offset":
      return moveNodeByOffset(
        layout,
        action.nodeId,
        action.params.dx,
        action.params.dy
      );

    case "resize_node":
      return resizeNode(
        layout,
        action.nodeId,
        action.params.scale
      );

    case "move_node_relative":
      return moveNodeRelativeToNode(
        layout,
        action.movingNodeId,
        action.referenceNodeId,
        action.params.relation,
        action.params.gap
      );

    case "delete_node":
      return deleteNode(
        layout,
        action.nodeId
      );

    case "change_node_style":
    case "update_node_style":
      return changeNodeStyle(
        layout,
        action.nodeId,
        action.params.property,
        action.params.value
      );

    /**
     * BULK ACTIONS
     */

    case "resize_nodes":
      return resizeNodesByType(
        layout,
        action.target.nodeType,
        action.params.scale
      );

    case "move_nodes_offset_bulk":
      return moveNodesByTypeOffset(
        layout,
        action.target.nodeType,
        action.params.dx,
        action.params.dy
      );

    case "delete_nodes":
      return deleteNodesByType(
        layout,
        action.target.nodeType
      );

    case "align_nodes":
      return alignNodesByType(
        layout,
        action.target.nodeType,
        action.params.alignment
      );

    /**
     * HISTORY
     */

    case "undo":
      return restoreLayoutFromHistory(
        history,
        action.params?.stepsBack || 1
      );

    case "redo":
      return restoreLayoutFromRedoHistory(
        redoHistory,
        action.params?.stepsForward || 1
      );

    default:
      throw new Error(`Unhandled action: ${action.type}`);
  }
}

export function executeActionPlan(
  layout,
  actions,
  history = [],
  redoHistory = []
) {
  validateActionPlan(actions);

  let workingLayout = layout;

  for (const action of actions) {
    workingLayout = executeAction(
      workingLayout,
      action,
      history,
      redoHistory
    );
  }

  return workingLayout;
}