package com.graphing.calc;

import java.applet.Applet;
import java.awt.Checkbox;
import java.awt.Color;
import java.awt.Event;
import java.awt.Graphics;
import java.awt.Label;
import java.awt.TextField;
import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;

public class GraphingCalc extends Applet implements KeyListener
{
	private static final long serialVersionUID = 5820516902533795996L;
	TextField eqField;
	Checkbox first, second, extrema, poi;
	private int PAGE_WIDTH = 800;
	private int PAGE_HEIGHT = 800;
	private int AXIS_THICKNESS = 3;
	private int LINES = 19;
	private int graphWidth;
	private int graphHeight;
	private double STEP = .01;
	private boolean draw = false;

	public void init()
	{
		graphWidth = (int) (PAGE_WIDTH * .8);
		graphHeight = (int) (PAGE_HEIGHT * .8);
		setSize(PAGE_WIDTH, PAGE_HEIGHT);
		add(new Label("f(x) = "));
		eqField = new TextField(12);
		eqField.addKeyListener(this);
		add(eqField);
		eqField.setText("x");
		first = new Checkbox("1st derivative");
		second = new Checkbox("2nd derivative");
		add(first);
		add(second);
		extrema = new Checkbox("Extrema");
		poi = new Checkbox("POI");
		add(extrema);
		add(poi);
		setBackground(Color.WHITE);
	}

	public void plotPoint(double x, double y, Graphics g, Color c, int thickness) {
		if (Math.abs(y) > (LINES - 1) / 2) return;

		int xCoord = (int) (x * graphWidth / (LINES - 1));
		int yCoord = (int) (y * graphWidth / (LINES - 1));
		g.setColor(c);
		g.fillRect((int) (PAGE_WIDTH / 2) - 1 - (thickness / 2) + xCoord, (int) (PAGE_WIDTH / 2) - 1 - (thickness / 2) - yCoord, thickness, thickness);
	}

	public void plotSet(double[][] points, Graphics g, Color c, int thickness) {
		for (int i = 0; i < points[0].length; i++) {
			plotPoint(points[0][i], points[1][i], g, c, thickness);
		}
	}

	public double[][] calcDerivative(double[][] points) {
		double[][] derivative = new double[2][points[0].length - 1];
		double lastX = points[0][0], lastY = points[1][0];
		for (int i = 1; i < points[0].length; i++) {
			double slope = (points[1][i] - lastY) / (points[0][i] - lastX);
			derivative[0][i - 1] = (lastX + points[0][i]) / 2;
			derivative[1][i - 1] = slope;
			lastX = points[0][i];
			lastY = points[1][i];
		}
		return derivative;
	}

	public void getZero(double[][] fx, double[][] extrema, Graphics g, Color c) {
		double unit = Math.abs(extrema[1][0]) / extrema[1][0];
		for (int i = 0; i < extrema[0].length; i++) {
			if (Math.abs(extrema[1][i]) / extrema[1][i] != unit) {
				double x = extrema[0][i];
				for (int j = 0; j < fx[0].length; j++) {
					if (fx[0][j] > x) {
						plotPoint(fx[0][j - 1], fx[1][j - 1], g, c, 6);
						break;
					}
				}
				unit = Math.abs(extrema[1][i + 1]) / extrema[1][i + 1];
				i++;
			}
		}
	}

	public void paint(Graphics g)
	{
		if (draw) {
			double[][] points = new double[2][(int) ((LINES - 1) / STEP)];

			for (int i = 0; i < LINES; i++) {
				g.fillRect((int) (PAGE_WIDTH * .1), (int) (PAGE_HEIGHT * .1) + (graphHeight * i / (LINES - 1)), graphWidth, 1);
			}
			for (int i = 0; i < LINES; i++) {
				g.fillRect((int) (PAGE_WIDTH * .1) + (graphWidth * i / (LINES - 1)), (int) (PAGE_HEIGHT * .1), 1, graphHeight);
			}
			g.fillRect((int) (PAGE_WIDTH / 2) - 1, (int) (PAGE_HEIGHT * .1), AXIS_THICKNESS, graphHeight);
			g.fillRect((int) (PAGE_WIDTH * .1), (int) (PAGE_HEIGHT / 2) - 1, graphWidth, AXIS_THICKNESS);
			String eq = eqField.getText();
			MathEvaluator m = new MathEvaluator(eq.replaceAll("pi", "(" + Double.toString(Math.PI) + ")").replaceAll("e", "(" + Double.toString(Math.E) + ")"));
			for (int i = 0; i < (int) ((LINES - 1) / STEP); i++) {
				double x = (i - ((LINES - 1) / (2 * STEP))) * STEP;
				try {
					m.addVariable("x", x);
					points[0][i] = x;
					points[1][i] = m.getValue();
				}
				catch (Exception e) { }
			}

			plotSet(points, g, Color.BLUE, 2);
			double[][] speed = calcDerivative(points);
			if (first.getState())
				plotSet(speed, g, Color.RED, 2);
			if (extrema.getState()) 
				getZero(points, speed, g, Color.ORANGE);
			double [][] acceleration = calcDerivative(speed);
			if (second.getState())
				plotSet(acceleration, g, Color.MAGENTA, 2);
			if (poi.getState())
				getZero(points, acceleration, g, Color.BLACK);

			draw = false;
		}
	}

	public void keyPressed(KeyEvent e) {
		if(e.getKeyCode() == KeyEvent.VK_ENTER) {
			draw = true;
			repaint();
		}
	}

	public boolean action(Event event, Object obj)
	{
		return true;
	}

	@Override
	public void keyReleased(KeyEvent arg0) {
		// TODO Auto-generated method stub
	}

	@Override
	public void keyTyped(KeyEvent arg0) {
		// TODO Auto-generated method stub
	}
}