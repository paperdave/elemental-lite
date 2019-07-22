# Element Format
```py
# Comments with hashtag, only at the beginning of a line

# Some Pack Metadata
Title = Your Pack Name
Description = Your Pack Description (Optional)

# Color Definitions
#
#   Type in a color name followed by a colon, followed by a hex color code.
#   Trying to redefine a color has no effect
#
Air: #B4D8FC
This is Also Valid   :      #B4D8FC

# Element Definitions
#
#   For elements received at the start, you just write in the element name]
#   and it's color
#
Air (Air)

#
#   For elements that have a combination, you write the recipe then the
#   resulting element
#
Air + Air = Steam (Air)

#
#   To add comments to an element, use a dash.
#
Air - A Piece of Air.

#
#   Element and Color names cannot contain the following characters
#      {};()=+:_-*!
#
```
