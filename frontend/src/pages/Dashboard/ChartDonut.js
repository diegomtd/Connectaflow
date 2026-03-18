import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

import { useTheme as useThemeV4 } from "@material-ui/core/styles";
import { useTheme as useThemeV5 } from "@mui/material/styles";

const ChartDonut = ({ value, data, colors }) => {
  const themeV4 = useThemeV4();
  const themeV5 = useThemeV5();

  const isDark =
    themeV5?.palette?.mode === "dark" ||
    themeV4?.palette?.type  === "dark";

  // Cores de texto adaptadas ao modo
  const textPrimary = isDark ? "#f0f4f8" : "#0d1b2a";
  const textMuted   = isDark ? "#4d6478" : "#8fa0b0";

  const chartData   = Array.isArray(data)   ? data   : [];
  const chartColors = Array.isArray(colors) ? colors : ["#ccc"];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={85}
          innerRadius={65}
          paddingAngle={3}
          strokeWidth={0}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}

          <Label
            position="center"
            content={({ viewBox }) => {
              const { cx, cy } = viewBox;
              return (
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan
                    x={cx} y={cy}
                    fontSize="36"
                    fontWeight="700"
                    fontFamily="'JetBrains Mono', 'Fira Mono', monospace"
                    fill={textPrimary}
                  >
                    {`${value}`}
                  </tspan>
                  <tspan
                    x={cx} y={cy + 22}
                    fontSize="12"
                    fontWeight="600"
                    fontFamily="'DM Sans', system-ui, sans-serif"
                    fill={textMuted}
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                  >
                    SCORE
                  </tspan>
                </text>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default ChartDonut;