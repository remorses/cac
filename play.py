from manim import *
import numpy as np


class HeatTransferAnimation(Scene):
    def construct(self):
        # Configuration
        num_blocks = 10
        block_size = 1
        spacing = 0.1
        step_time = 0.5
        fps = 30  # frames per second
        pause_time = 0.1  # pause duration when blocks align
        color_change_time = 0.5  # duration of color change animation

        # Create top and bottom rows
        top_row = VGroup(
            *[Square(side_length=block_size, stroke_width=1) for _ in range(num_blocks)]
        )
        bottom_row = VGroup(
            *[Square(side_length=block_size, stroke_width=1) for _ in range(num_blocks)]
        )

        # Set initial positions
        top_row.arrange(RIGHT, buff=spacing)
        bottom_row.arrange(RIGHT, buff=spacing)
        bottom_row.shift(DOWN * (block_size + spacing))
        bottom_row.shift(RIGHT * (block_size + spacing) * num_blocks / 2)
        top_row.shift(LEFT * (block_size + spacing) * num_blocks / 2)

        # Set initial temperatures and colors
        top_temps = [1.0] * num_blocks
        bottom_temps = [0.0] * num_blocks

        def get_color(temp):
            return color_gradient((BLACK, RED), 101)[int(temp * 100)]

        def update_colors(row, temps):
            for square, temp in zip(row, temps):
                square.set_fill(color=get_color(temp), opacity=1)

        update_colors(top_row, top_temps)
        update_colors(bottom_row, bottom_temps)

        # Add rows to the scene
        self.add(top_row, bottom_row)

        # Animate the movement and heat transfer
        for offset in range(num_blocks * 2):
            # Move rows
            self.play(
                top_row.animate.shift(RIGHT * (block_size + spacing) / 2),
                bottom_row.animate.shift(LEFT * (block_size + spacing) / 2),
                run_time=step_time,
                rate_func=linear,
            )

            # Pause movement
            self.wait(pause_time)

            # Perform heat transfer and prepare color change animations
            color_animations = []
            for i in range(num_blocks):
                top_index = num_blocks - 1 - i
                bottom_index = offset - i
                if bottom_index < 0 or bottom_index >= num_blocks:
                    continue

                avg_temp = (top_temps[top_index] + bottom_temps[bottom_index]) / 2
                top_temps[top_index] = avg_temp
                bottom_temps[bottom_index] = avg_temp

                color_animations.extend(
                    [
                        top_row[top_index].animate.set_fill(color=get_color(avg_temp)),
                        bottom_row[bottom_index].animate.set_fill(
                            color=get_color(avg_temp)
                        ),
                    ]
                )

            # Animate all color changes concurrently
            if color_animations:
                self.play(*color_animations, run_time=color_change_time)

            # Pause movement
            self.wait(pause_time)

        # Final wait
        self.wait(1)
