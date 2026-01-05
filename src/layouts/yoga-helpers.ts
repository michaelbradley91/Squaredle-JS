import Yoga, { Node } from "yoga-layout";

/**
 * Get the absolute coordinates as a rectangle for the given node
 * going up the node tree to its parent.
 * 
 * @param node the node to get the absolute coordinates from
 * @returns The rectangle on the screen for this node
 */
export function get_absolute_rect(node: Node | undefined): { x: number, y: number, width: number, height: number }
{
    if (!node)
    {
        return { x: 0, y: 0, width: 0, height: 0 };
    }
    const width = node.getComputedWidth();
    const height = node.getComputedHeight();
    let x = node.getComputedLeft();
    let y = node.getComputedTop();
    let parent = node.getParent();
    while (parent) 
    {
        x += parent.getComputedLeft();
        y += parent.getComputedTop();
        parent = parent.getParent();
    }
    return { x: x, y: y, width: width, height: height };
}

/**
 * Append a child to the end of a parent node
 * @param parent the parent node to add the child to
 * @param child the child node
 */
export function append_child(parent: Node, child: Node): void
{
    parent.insertChild(child, parent.getChildCount());
}
